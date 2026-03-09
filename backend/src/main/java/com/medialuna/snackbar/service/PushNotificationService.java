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
import org.springframework.scheduling.annotation.Async;

import lombok.extern.slf4j.Slf4j;

@Slf4j
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
            log.info("✅ PushService inicializado correctamente con VAPID keys");
        } catch (Exception e) {
            log.error("❌ ERROR inicializando PushService con VAPID keys: {}", e.getMessage(), e);
            pushService = null;
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

    @Async
    public void sendOrderNotification(com.medialuna.snackbar.model.CustomerOrder order) {
        try {
            if (pushService == null) {
                log.error("❌ PushService es null — VAPID keys no se inicializaron correctamente");
                return;
            }
            NumberFormat mxnFormat = NumberFormat.getCurrencyInstance(new Locale("es", "MX"));
            double total = order.getTotal() != null ? order.getTotal() : 0.0;
            String formattedTotal = mxnFormat.format(total);
            String payload = String.format(
                    "{\"title\":\"¡Nuevo Pedido!\",\"body\":\"%s pidió por %s (ID: %s)\",\"icon\":\"/icons/icon-192.png\",\"url\":\"/admin\"}",
                    order.getCustomer(), formattedTotal, order.getId());

            List<PushSubscription> owners = subscriptionRepository.findByRole("owner");
            log.info("📢 Enviando push notification de pedido #{} a {} suscriptores", order.getId(), owners.size());
            if (owners.isEmpty()) {
                log.warn(
                        "⚠️ No hay suscriptores push registrados con role 'owner'. Visita /admin y activa las notificaciones.");
            }
            for (PushSubscription sub : owners) {
                sendNotification(sub, payload);
            }
        } catch (Exception e) {
            log.error("❌ Error en sendOrderNotification: {}", e.getMessage(), e);
        }
    }

    @Async
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
                    .ttl(86400) // 24 hours TTL required by some push services
                    .urgency(nl.martijndwars.webpush.Urgency.HIGH) // Required by iOS/APNs for background delivery
                    .build();

            pushService.send(notification);
            log.info("✅ Push notification enviada a endpoint: {}...",
                    sub.getEndpoint().substring(0, Math.min(60, sub.getEndpoint().length())));
        } catch (Exception e) {
            log.error("❌ Error enviando push a endpoint: {}... Error: {}",
                    sub.getEndpoint().substring(0, Math.min(60, sub.getEndpoint().length())), e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("410")) {
                log.info("🗑️ Eliminando suscripción expirada (410 Gone)");
                removeSubscription(sub.getEndpoint());
            }
        }
    }
}
