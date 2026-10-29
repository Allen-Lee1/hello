package com.allen.simpleboot.web;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WebApplicationTest {
    @Autowired
    private MockMvc mvc;

    @Test
    void rootUsesWelcomePage() throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(forwardedUrl("index.html"));
    }

    @Test
    void welcomePageIsServed() throws Exception {
        mvc.perform(get("/index.html")).andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse()
                        .getContentAsString(StandardCharsets.UTF_8)).contains("Simple Boot 已启动"));
    }

    @Test
    void infoEndpointUsesSharedResponse() throws Exception {
        mvc.perform(get("/web/info")).andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.application").value("simple-boot-web"));
    }

    @Test
    void healthEndpointIsAvailable() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void apiControllersAreNotLoadedIntoWeb() throws Exception {
        mvc.perform(get("/api/demo/greeting")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }
}
