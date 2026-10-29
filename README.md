# simple-boot

一个简单的 Spring Boot 多模块起步项目。API 和 Web 是两个可独立启动、独立打包的应用，使用常规分层，方便后续添加业务。

## 招聘信息聚合产品规划

业务规划与原型范围见 [产品文档目录](docs/README.md)，包含 [页面清单](docs/招聘信息聚合-原型范围与页面清单.md) 与 [会员及售后规则](docs/会员与售后规则.md)。文档区分已确认需求、建议方案与待定事项；当前代码是起步框架，招聘采集、会员和真实支付尚未实现。

已提供 [三端可点击原型](https://zhiyu-jobs-prototype.kindgoose16.chatgpt.site)（私有访问），覆盖 C 端网站、微信小程序与管理后台。源码位于 [prototype](prototype/README.md)，操作步骤和验证范围见 [原型使用与验收](docs/交互原型使用与验收.md)。原型全部使用虚构数据及模拟交易，不代表业务服务已经实现。

## 技术栈

- Java 17+（建议使用 JDK 17 或 21）
- Spring Boot 4.1.2、Spring MVC、Jakarta Validation、Actuator
- Maven 3.6.3+
- JUnit Jupiter、MockMvc
- Web 使用 Spring Boot 托管静态页面，暂不引入 Node.js 或前端构建工具

不依赖数据库、Redis、注册中心或其他外部服务，首次运行只需 JDK 和 Maven。

## 模块与分层

```text
simple-boot/
├── pom.xml                 # 父工程，统一版本并聚合模块
├── common/                 # 普通 jar：统一返回、业务异常、全局异常处理
├── api/                    # 独立应用，默认 8080
│   └── src/main/java/com/allen/simpleboot/api/
│       ├── controller/     # HTTP 路由、入参校验、返回结果
│       ├── service/        # 业务逻辑，先用具体类，不强制接口 + impl
│       └── dto/            # 请求、响应对象
└── web/                    # 独立应用，默认 8081
    └── src/main/
        ├── java/com/allen/simpleboot/web/controller/
        └── resources/static/index.html
```

依赖方向：`api → common`，`web → common`。两个应用不互相依赖，`common` 不是第三个应用。

后续接入数据库时，在实际有持久化业务的应用中增加 `mapper` / `repository` 和 `entity` 包即可。业务较多后，可在模块内按业务功能组织包。多个应用确实需要复用业务逻辑时，再提取一个普通业务模块，避免把所有业务堆进 `common`。

当前 Web 提供独立页面和 Web 接口，没有跨应用调用；API、Web 启动互不依赖。后续需要联调时，再根据实际前端方案配置代理、服务端调用或受限的 CORS。

## 快速启动

确认终端使用的是 **JDK 17+**，并且 `mvn -version` 中的 Java 版本也是 17+。Java 8 无法编译本项目。

在仓库根目录执行：

```shell
mvn clean verify
```

分别在两个终端启动：

```shell
java -jar api/target/api-0.0.1-SNAPSHOT.jar
```

```shell
java -jar web/target/web-0.0.1-SNAPSHOT.jar
```

访问：

| 用途 | 地址 |
| --- | --- |
| API 示例 | http://localhost:8080/api/demo/greeting?name=Allen |
| API 健康检查 | http://localhost:8080/actuator/health |
| Web 首页 | http://localhost:8081/ |
| Web 示例接口 | http://localhost:8081/web/info |
| Web 健康检查 | http://localhost:8081/actuator/health |

IDEA 中导入根目录 `pom.xml`，将 Project SDK、Maven Runner JRE 配置为 JDK 17+，运行 `ApiApplication` 和 `WebApplication` 即可。

### Maven 开发启动

先把父工程及公共模块安装到本地仓库：

```shell
mvn -pl common -am install
```

再分别启动：

```shell
mvn -pl api spring-boot:run
mvn -pl web spring-boot:run
```

这两个命令应在不同终端执行。不要对整个聚合工程直接执行 `spring-boot:run`，父工程和 common 没有启动类。

### 更改端口和环境

默认端口通过环境变量 `API_PORT`、`WEB_PORT` 覆盖，也可以使用命令行：

```shell
java -jar api/target/api-0.0.1-SNAPSHOT.jar --server.port=9090
java -jar web/target/web-0.0.1-SNAPSHOT.jar --server.port=9091
```

需要本地私有配置时，在对应应用的 `src/main/resources/` 下创建 `application-local.yml`，启动时加 `--spring.profiles.active=local`。该文件已被 Git 忽略。正式环境的密码、Token 等使用环境变量或外部配置，不写入仓库。

## 接口示例

```shell
curl "http://localhost:8080/api/demo/greeting?name=Allen"
curl -X POST "http://localhost:8080/api/demo/greeting" -H "Content-Type: application/json" -d '{"name":"Allen"}'
```

上面的 POST 命令适用于 Bash。Windows PowerShell 可以使用：

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/demo/greeting' -ContentType 'application/json' -Body '{"name":"Allen"}'
```

成功响应：

```json
{"code":0,"message":"success","data":{"application":"simple-boot-api","greeting":"你好，Allen！"}}
```

姓名不能为空，最长 50 个字符；校验失败返回 HTTP 400，例如：

```json
{"code":400,"message":"name: 姓名不能为空","data":null}
```

Controller 使用构造器注入 Service。业务失败可以抛出 `BusinessException("用户可读的提示")`，由公共异常处理器转换为 HTTP 400。未预期的异常仅在服务端记录详细日志，响应不暴露内部信息。健康检查遵循 Actuator 自身的响应格式。

## 测试与后续开发

`mvn clean verify` 会运行两个应用的集成测试，覆盖正常接口、参数校验、错误状态、静态首页、健康检查及应用间路由隔离，然后生成两个可执行 jar。

GitHub Actions 在 push 和 pull request 时使用 JDK 17 运行相同的构建命令，并实际启动两个可执行 jar，验证健康检查、GET/POST 接口、参数校验和中文首页。已安装 Python 3 时，也可以在构建后执行 `python scripts/smoke-test.py` 进行同样的运行检查，测试结束会自动停止应用。

下一步可按业务需要添加数据库、登录认证、权限、接口文档等。当前项目是开发脚手架，尚未实现登录或访问控制；部署为正式业务服务前应补充相应功能。
