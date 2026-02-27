package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.CustomerOrder;
import com.medialuna.snackbar.model.PushSubscription;
import com.medialuna.snackbar.repository.PushSubscriptionRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.List;

@Service
public class PushNotificationService {

    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    @Value("${vapid.subject}")
    private String subject;

    private PushService pushService;

    @Autowired
    private PushSubscriptionRepository subscriptionRepository;

    @PostConstruct
    public void init() throws Exception {
        Security.addProvider(new BouncyCastleProvider());
        pushService = new PushService(publicKey, privateKey, subject);
    }

    public void sendOrderNotification(CustomerOrder order) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAll();
        String payload = "{\"title\": \"Nuevo Pedido\", \"body\": \"Cliente: " + order.getCustomer()
                + "\", \"url\": \"/admin/orders\"}";

        for (PushSubscription sub : subscriptions) {
            try {
                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payload.getBytes());
                pushService.send(notification);
            } catch (Exception e) {
                e.printStackTrace(); // Handle expired subscriptions (410 Gone) usually by deleting them
            }
        }
    }
}
