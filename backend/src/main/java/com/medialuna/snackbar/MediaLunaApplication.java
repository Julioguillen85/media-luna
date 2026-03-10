package com.medialuna.snackbar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MediaLunaApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediaLunaApplication.class, args);
    }
}
