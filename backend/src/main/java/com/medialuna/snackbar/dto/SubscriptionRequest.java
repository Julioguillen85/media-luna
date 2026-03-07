package com.medialuna.snackbar.dto;

import lombok.Data;

@Data
public class SubscriptionRequest {
    private String endpoint;
    private String expirationTime;
    private Keys keys;

    @Data
    public static class Keys {
        private String p256dh;
        private String auth;
    }
}
