package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.PushSubscription;
import com.medialuna.snackbar.repository.PushSubscriptionRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private PushSubscriptionRepository subscriptionRepository;

    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    private PushService pushService;

    @PostConstruct
    public void init() throws Exception {
        Security.addProvider(new BouncyCastleProvider());
        pushService = new PushService(publicKey, privateKey, "mailto:admin@medialuna.com");
    }

    @GetMapping("/vapid-public-key")
    public Map<String, String> getVapidPublicKey() {
        return Map.of("publicKey", publicKey);
    }

    @PostMapping("/subscribe")
    public void subscribe(@RequestBody PushSubscription subscription) {
        subscriptionRepository.save(subscription);
        System.out.println("New push subscription saved!");
    }

    @PostMapping("/test")
    public void sendTestNotification(@RequestBody PushSubscription subscription) {
        try {
            Notification notification = new Notification(
                    subscription.getEndpoint(),
                    subscription.getP256dh(),
                    subscription.getAuth(),
                    "{\"title\": \"Test Notification\", \"body\": \"This is a test notification from Snackbar!\"}"
                            .getBytes());
            pushService.send(notification);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
