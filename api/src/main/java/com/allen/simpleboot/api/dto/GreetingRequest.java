package com.allen.simpleboot.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GreetingRequest(
        @NotBlank(message = "姓名不能为空")
        @Size(max = 50, message = "姓名不能超过50个字符") String name) {
}
