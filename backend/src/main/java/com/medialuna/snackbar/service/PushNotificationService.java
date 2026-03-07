package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.PushSubscription;
import com.medialuna.snackbar.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Service
public class PushNotificationService {

    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    @Value("${vapid.subject}")
    private String subject;

    @Autowired
    private PushSubscriptionRepository subscriptionRepository;

    private PushService pushService;

    @PostConstruct
    private void init() {
        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            pushService = new PushService();
            pushService.setPublicKey(publicKey);
            pushService.setPrivateKey(privateKey);
            pushService.setSubject(subject);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void subscribe(PushSubscription subscription) {
        if (subscriptionRepository.findByEndpoint(subscription.getEndpoint()).isEmpty()) {
            subscriptionRepository.save(subscription);
        } else {
            PushSubscription existing = subscriptionRepository.findByEndpoint(subscription.getEndpoint()).get();
            existing.setP256dh(subscription.getP256dh());
            existing.setAuth(subscription.getAuth());
            subscriptionRepository.save(existing);
        }
    }

    public void removeSubscription(String endpoint) {
        subscriptionRepository.findByEndpoint(endpoint).ifPresent(sub -> subscriptionRepository.delete(sub));
    }

    public void sendOrderNotification(com.medialuna.snackbar.model.CustomerOrder order) {
        NumberFormat mxnFormat = NumberFormat.getCurrencyInstance(new Locale("es", "MX"));
        double total = order.getTotal() != null ? order.getTotal() : 0.0;
        String formattedTotal = mxnFormat.format(total);
        String payload = String.format(
                "{\"title\":\"¡Nuevo Pedido!\",\"body\":\"%s pidió por %s (ID: %s)\",\"icon\":\"/icons/icon-192.png\",\"url\":\"/admin\"}",
                order.getCustomer(), formattedTotal, order.getId());

        List<PushSubscription> owners = subscriptionRepository.findByRole("owner");
        for (PushSubscription sub : owners) {
            sendNotification(sub, payload);
        }
    }

    public void sendTestNotification() {
        String payload = "{\"title\":\"Prueba de Notificación\",\"body\":\"¡Las notificaciones Push funcionan correctamente en Media Luna!\",\"icon\":\"/icons/icon-192.png\",\"url\":\"/admin\"}";
        List<PushSubscription> owners = subscriptionRepository.findByRole("owner");
        for (PushSubscription sub : owners) {
            sendNotification(sub, payload);
        }
    }

    private void sendNotification(PushSubscription sub, String payload) {
        try {
            Notification notification = Notification.builder()
                    .endpoint(sub.getEndpoint())
                    .userPublicKey(sub.getP256dh())
                    .userAuth(sub.getAuth())
                    .payload(payload.getBytes("UTF-8"))
                    .build();

            pushService.send(notification);
        } catch (Exception e) {
            System.err.println("Failed to send push notification to endpoint: " + sub.getEndpoint() + ". Error: "
                    + e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("410")) {
                removeSubscription(sub.getEndpoint());
            }
        }
    }
}
