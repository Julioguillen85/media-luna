package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.dto.SubscriptionRequest;
import com.medialuna.snackbar.model.PushSubscription;
import com.medialuna.snackbar.service.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private PushNotificationService pushNotificationService;

    @Value("${vapid.public.key}")
    private String publicKey;

    @GetMapping("/vapid-public-key")
    public Map<String, String> getVapidPublicKey() {
        return Map.of("publicKey", publicKey);
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody SubscriptionRequest request) {
        log.info("📥 Nueva suscripción push recibida en /api/notifications/subscribe");

        if (request.getKeys() == null || request.getKeys().getP256dh() == null || request.getKeys().getAuth() == null) {
            log.error("❌ Suscripción push inválida: keys faltantes");
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid subscription data"));
        }

        PushSubscription sub = new PushSubscription();
        sub.setEndpoint(request.getEndpoint());
        sub.setP256dh(request.getKeys().getP256dh());
        sub.setAuth(request.getKeys().getAuth());
        sub.setRole("owner");

        pushNotificationService.subscribe(sub);
        log.info("✅ Suscripción push guardada correctamente para endpoint: {}...",
                request.getEndpoint().substring(0, Math.min(60, request.getEndpoint().length())));

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTestNotification() {
        pushNotificationService.sendTestNotification();
        return ResponseEntity.ok(Map.of("success", true, "message", "Test notification sent"));
    }
}
