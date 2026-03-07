package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.dto.SubscriptionRequest;
import com.medialuna.snackbar.model.PushSubscription;
import com.medialuna.snackbar.service.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
public class PushController {

    @Autowired
    private PushNotificationService pushNotificationService;

    @Value("${vapid.public.key}")
    private String publicKey;

    @GetMapping("/public-key")
    public ResponseEntity<?> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", publicKey));
    }

    @PostMapping("/subscribe")
    // Consider restricting this if needed, for instance
    // @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    // but the PWA guide implies the owner does it from Chrome directly. It might be
    // better
    // to protect it or keep it open since role is hardcoded to "owner".
    // We'll leave it without Security for ease of testing based on the prompt, or
    // add auth if requested.
    public ResponseEntity<?> subscribe(@RequestBody SubscriptionRequest request) {
        if (request.getKeys() == null || request.getKeys().getP256dh() == null || request.getKeys().getAuth() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid subscription data"));
        }

        PushSubscription sub = new PushSubscription();
        sub.setEndpoint(request.getEndpoint());
        sub.setP256dh(request.getKeys().getP256dh());
        sub.setAuth(request.getKeys().getAuth());
        sub.setRole("owner");

        pushNotificationService.subscribe(sub);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTest() {
        pushNotificationService.sendTestNotification();
        return ResponseEntity.ok(Map.of("success", true, "message", "Test notification sent to all owners"));
    }
}
