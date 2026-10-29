package com.allen.simpleboot.api.controller;

import com.allen.simpleboot.api.dto.GreetingRequest;
import com.allen.simpleboot.api.dto.GreetingResponse;
import com.allen.simpleboot.api.service.GreetingService;
import com.allen.simpleboot.common.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
public class DemoController {
    private final GreetingService greetingService;

    public DemoController(GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    @GetMapping("/greeting")
    public ApiResponse<GreetingResponse> greeting(
            @RequestParam(defaultValue = "Allen") @NotBlank @Size(max = 50) String name) {
        return ApiResponse.success(greetingService.greet(name));
    }

    @PostMapping("/greeting")
    public ApiResponse<GreetingResponse> greeting(@Valid @RequestBody GreetingRequest request) {
        return ApiResponse.success(greetingService.greet(request.name()));
    }
}
