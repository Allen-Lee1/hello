package com.allen.simpleboot.web.controller;

import com.allen.simpleboot.common.response.ApiResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SystemController {
    @GetMapping("/web/info")
    public ApiResponse<Map<String, String>> info() {
        return ApiResponse.success(Map.of("application", "simple-boot-web", "status", "running"));
    }
}
