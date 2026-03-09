package com.medialuna.snackbar.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class FileUploadController {

    @Value("${cloudinary.cloud.name:demo}")
    private String cloudName;

    @Value("${cloudinary.api.key:000000}")
    private String apiKey;

    @Value("${cloudinary.api.secret:000000}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
        log.info("☁️ Cloudinary configurado con cloud: {}", cloudName);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "medialuna",
                    "resource_type", "auto"));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("✅ Imagen subida a Cloudinary: {}", secureUrl);

            return ResponseEntity.ok(Map.of("url", secureUrl));

        } catch (Exception e) {
            log.error("❌ Error subiendo imagen a Cloudinary", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }
}
