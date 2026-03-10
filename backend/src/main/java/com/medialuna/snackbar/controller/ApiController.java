package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.*;
import com.medialuna.snackbar.repository.*;
import com.medialuna.snackbar.service.WhatsAppService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.extern.slf4j.Slf4j;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

@Slf4j
@RestController
@RequestMapping("/api")
public class ApiController {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private OptionsRepository optionsRepository;
    @Autowired
    private GalleryImageRepository galleryImageRepository;
    @Autowired
    private WhatsAppService whatsAppService;
    @Autowired
    private com.medialuna.snackbar.service.MercadoPagoService mercadoPagoService;
    @Autowired
    private FileUploadController fileUploadController;

    @GetMapping("/products")
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/products/type/{type}")
    public List<Product> getProductsByType(@PathVariable ProductType type) {
        return productRepository.findByProductType(type);
    }

    @PostMapping("/products")
    public Product saveProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // --- Gallery Endpoints ---
    @GetMapping("/gallery")
    public List<GalleryImage> getGalleryImages() {
        return galleryImageRepository.findAllByOrderByIdDesc();
    }

    @PostMapping("/gallery")
    public GalleryImage saveGalleryImage(@RequestBody GalleryImage image) {
        if (image.getCreatedAt() == null) {
            image.setCreatedAt(java.time.Instant.now().toString());
        }
        return galleryImageRepository.save(image);
    }

    @DeleteMapping("/gallery/{id}")
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteGalleryImage(@PathVariable("id") Long id) {
        return galleryImageRepository.findById(id).map(img -> {
            // Delete from Cloudinary if it's a cloud URL
            fileUploadController.deleteCloudinaryImage(img.getUrl());
            galleryImageRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "Imagen eliminada"));
        }).orElse(ResponseEntity.notFound().build());
    }
    // ------------------------

    @PutMapping("/orders/{id}/status")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        return orderRepository.findById(id).map(order -> {
            String newStatus = body.get("status");
            order.setStatus(newStatus);
            orderRepository.save(order);

            // Force-initialize items while still in transaction
            if (order.getItems() != null) {
                order.getItems().size();
            }

            // Dispatch async emails on status changes
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    if ("CONFIRMED".equalsIgnoreCase(newStatus)) {
                        emailService.sendOrderConfirmedEmail(order);
                    } else if ("COMPLETED".equalsIgnoreCase(newStatus)) {
                        emailService.sendOrderCompletedEmail(order);
                    }
                } catch (Exception e) {
                    log.error("Error enviando email al cliente: ", e);
                }
            });

            return ResponseEntity.ok(order);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long id) {
        log.info("Solicitando eliminación de producto ID: {}", id);

        // Buscar el producto usando Optional
        Optional<Product> productOptional = productRepository.findById(id);

        // Si el producto existe, eliminarlo
        return productOptional.map(product -> {
            try {
                // Delete image from Cloudinary if applicable
                fileUploadController.deleteCloudinaryImage(product.getImg());

                // Desvincular de órdenes
                orderItemRepository.detachProduct(id);
                log.info("Productos desvinculados de órdenes.");

                // Eliminar producto
                productRepository.deleteById(id);
                log.info("Producto eliminado correctamente: {}", id);

                return ResponseEntity.ok()
                        .body(Map.of("message", "Producto eliminado correctamente"));

            } catch (Exception e) {
                log.error("ERROR al eliminar producto {}: ", id, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Error al eliminar producto"));
            }
        }).orElse(ResponseEntity.notFound().build()); // Si no existe, retorna 404
    }

    @GetMapping("/orders")
    public List<CustomerOrder> getOrders() {
        return orderRepository.findAll();
    }

    @Autowired
    private com.medialuna.snackbar.service.EmailService emailService;
    @Autowired
    private com.medialuna.snackbar.service.PushNotificationService pushNotificationService;

    @PostMapping("/orders")
    public CustomerOrder createOrder(@RequestBody CustomerOrder order) {
        order.setStatus("PENDING");
        // FIX: Clean items to ensure new insert
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getId() != null) {
                    item.setProductId(item.getId());
                    item.setId(null);
                }
            }
        }
        CustomerOrder saved = orderRepository.save(order);

        // Generate MP Payment Link for $500 MXN deposit
        try {
            String paymentLink = mercadoPagoService.generatePaymentLink(saved);
            if (paymentLink != null) {
                saved.setPaymentLink(paymentLink);
                saved = orderRepository.save(saved);
            }
        } catch (Exception e) {
            log.warn("Warning: Could not generation MP Payment link", e);
        }

        whatsAppService.sendOrderNotification(saved);

        // Trigger generic notifications (Async ideally, but sync for now)
        try {
            emailService.sendOrderNotification(saved); // Admin email
        } catch (Exception e) {
            log.error("Error sending admin email notification", e);
        }

        try {
            pushNotificationService.sendOrderNotification(saved);
        } catch (Exception e) {
            log.error("Error sending push notification", e);
        }

        return saved;
    }

    @GetMapping("/options")
    public IngredientOptions getOptions() {
        return optionsRepository.findById(1L).orElse(new IngredientOptions());
    }

    @PostMapping("/options")
    public IngredientOptions updateOptions(@RequestBody IngredientOptions options) {
        options.setId(1L);
        return optionsRepository.save(options);
    }

    @Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;
    @Autowired
    private com.medialuna.snackbar.security.JwtUtil jwtUtil;
    @Autowired
    private com.medialuna.snackbar.service.CustomUserDetailsService userDetailsService;

    // ... existing mappings ...

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        try {
            authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            creds.get("username"), creds.get("password")));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.warn("Login failed for user: {}", creds.get("username"));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect username or password");
        } catch (Exception e) {
            log.error("Unexpected error during login", e);
            throw e; // Let global handler pick it up
        }

        final org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService
                .loadUserByUsername(creds.get("username"));

        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }

    // Inner class for response
    @Data
    @AllArgsConstructor
    public static class AuthenticationResponse {
        private String jwt;
    }
}
