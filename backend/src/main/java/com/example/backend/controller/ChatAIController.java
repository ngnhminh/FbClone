package com.example.backend.controller;

import com.example.backend.service.GeminiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatAIController {

    @Autowired
    private GeminiChatService geminiChatService;

    @PostMapping
    public String sendMessage(@RequestBody String prompt) throws Exception {
        return geminiChatService.getGeminiResponse(prompt);
    }
}