package com.allen.simpleboot.api.service;

import com.allen.simpleboot.api.dto.GreetingResponse;
import org.springframework.stereotype.Service;

@Service
public class GreetingService {
    public GreetingResponse greet(String name) {
        return new GreetingResponse("simple-boot-api", "你好，" + name.strip() + "！");
    }
}
