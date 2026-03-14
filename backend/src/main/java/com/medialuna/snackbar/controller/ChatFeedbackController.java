package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.ChatFeedback;
import com.medialuna.snackbar.repository.ChatFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat-feedback")
@CrossOrigin(origins = "*")
public class ChatFeedbackController {

    @Autowired
    private ChatFeedbackRepository feedbackRepository;

    @PostMapping
    public ResponseEntity<ChatFeedback> saveFeedback(@RequestBody ChatFeedback feedback) {
        ChatFeedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(saved);
    }
}
