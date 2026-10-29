"""Start both packaged apps and verify HTTP behavior using only Python's standard library."""
import json
from pathlib import Path
import socket
import subprocess
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]


def free_port():
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        return listener.getsockname()[1]


def request(address, path, body=None):
    payload = None if body is None else json.dumps(body).encode("utf-8")
    req = Request(address + path, data=payload,
                  headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        response = urlopen(req, timeout=2)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.read().decode("utf-8")


def wait_healthy(address, process):
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f"Application exited with code {process.returncode}")
        try:
            status, body = request(address, "/actuator/health")
            if status == 200 and json.loads(body)["status"] == "UP":
                return
        except (URLError, TimeoutError, ConnectionError):
            pass
        time.sleep(0.3)
    raise RuntimeError(f"Timed out waiting for {address}")


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    processes = []
    logs = []
    with tempfile.TemporaryDirectory(prefix="simple-boot-smoke-") as directory:
        try:
            addresses = {}
            for module in ("api", "web"):
                jar = ROOT / module / "target" / f"{module}-0.0.1-SNAPSHOT.jar"
                check(jar.is_file(), f"Build the project first: missing {jar}")
                port = free_port()
                log = open(Path(directory) / f"{module}.log", "w+", encoding="utf-8")
                logs.append(log)
                process = subprocess.Popen(
                    ["java", "-jar", str(jar), f"--server.port={port}",
                     "--server.address=127.0.0.1"], stdout=log, stderr=subprocess.STDOUT)
                processes.append(process)
                addresses[module] = f"http://127.0.0.1:{port}"
                wait_healthy(addresses[module], process)

            status, body = request(addresses["api"], "/api/demo/greeting?name=Allen")
            check(status == 200 and json.loads(body)["data"]["greeting"] == "你好，Allen！",
                  "GET greeting failed")
            status, body = request(addresses["api"], "/api/demo/greeting", {"name": "小明"})
            check(status == 200 and json.loads(body)["data"]["greeting"] == "你好，小明！",
                  "POST greeting failed")
            status, body = request(addresses["api"], "/api/demo/greeting", {})
            check(status == 400 and json.loads(body)["code"] == 400, "Validation failed")
            status, body = request(addresses["web"], "/")
            check(status == 200 and "Simple Boot 已启动" in body, "Homepage failed")
            status, body = request(addresses["web"], "/web/info")
            check(status == 200 and json.loads(body)["data"]["application"] == "simple-boot-web",
                  "Web info failed")
            print("PASS: both executable jars started; health, GET/POST, validation and Web homepage verified.")
        except Exception:
            for log in logs:
                log.flush()
                log.seek(0)
                print(log.read())
            raise
        finally:
            for process in processes:
                if process.poll() is None:
                    process.terminate()
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=5)
            for log in logs:
                log.close()


if __name__ == "__main__":
    main()
