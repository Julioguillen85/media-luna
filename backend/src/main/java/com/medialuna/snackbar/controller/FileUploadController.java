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
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
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

    /**
     * Extract Cloudinary public_id from a secure URL and delete it
     */
    public void deleteCloudinaryImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary")) {
            return; // Not a Cloudinary URL, skip
        }
        try {
            // Extract public_id from URL like:
            // https://res.cloudinary.com/dxupld5lx/image/upload/v123/medialuna/abc123.jpg
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                String pathWithVersion = parts[1]; // v123/medialuna/abc123.jpg
                // Remove version prefix if present
                String path = pathWithVersion.replaceFirst("v\\d+/", "");
                // Remove file extension
                String publicId = path.replaceFirst("\\.[^.]+$", "");
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("🗑️ Imagen eliminada de Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.error("⚠️ Error eliminando imagen de Cloudinary: {}", e.getMessage());
        }
    }
}
