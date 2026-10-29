package com.allen.simpleboot.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiApplicationTest {
    @Autowired
    private MockMvc mvc;

    @Test
    void defaultGreeting() throws Exception {
        mvc.perform(get("/api/demo/greeting"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.application").value("simple-boot-api"))
                .andExpect(jsonPath("$.data.greeting").value("你好，Allen！"));
    }

    @Test
    void postGreetingTrimsName() throws Exception {
        mvc.perform(post("/api/demo/greeting").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"  小明  \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.greeting").value("你好，小明！"));
    }

    @Test
    void invalidNamesAreRejected() throws Exception {
        for (String body : new String[]{"{}", "{\"name\":\"   \"}",
                "{\"name\":\"" + "a".repeat(51) + "\"}"}) {
            mvc.perform(post("/api/demo/greeting").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(400));
        }
    }

    @Test
    void invalidQueryParameterIsRejected() throws Exception {
        mvc.perform(get("/api/demo/greeting").param("name", " "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void malformedJsonIsRejected() throws Exception {
        mvc.perform(post("/api/demo/greeting").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void frameworkErrorsKeepTheirHttpStatus() throws Exception {
        mvc.perform(get("/not-found"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value(404));
        mvc.perform(put("/api/demo/greeting"))
                .andExpect(status().isMethodNotAllowed()).andExpect(jsonPath("$.code").value(405));
    }

    @Test
    void healthEndpointIsAvailable() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void webControllersAreNotLoadedIntoApi() throws Exception {
        mvc.perform(get("/web/info")).andExpect(status().isNotFound());
    }
}
