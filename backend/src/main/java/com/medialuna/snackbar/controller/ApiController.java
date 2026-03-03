package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.*;
import com.medialuna.snackbar.repository.*;
import com.medialuna.snackbar.service.WhatsAppService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

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
    private WhatsAppService whatsAppService;
    @Autowired
    private com.medialuna.snackbar.service.MercadoPagoService mercadoPagoService;

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
                    System.err.println("Error enviando email al cliente: " + e.getMessage());
                }
            });

            return ResponseEntity.ok(order);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long id) {
        System.out.println("Solicitando eliminación de producto ID: " + id);

        // Buscar el producto usando Optional
        Optional<Product> productOptional = productRepository.findById(id);

        // Si el producto existe, eliminarlo
        return productOptional.map(product -> {
            try {
                // Desvincular de órdenes
                orderItemRepository.detachProduct(id);
                System.out.println("Productos desvinculados de órdenes.");

                // Eliminar producto
                productRepository.deleteById(id);
                System.out.println("Producto eliminado correctamente: " + id);

                return ResponseEntity.ok()
                        .body(Map.of("message", "Producto eliminado correctamente"));

            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("ERROR al eliminar: " + e.getMessage());
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

        // Generate MP Payment Link for 50% deposit
        try {
            String paymentLink = mercadoPagoService.generatePaymentLink(saved);
            if (paymentLink != null) {
                saved.setPaymentLink(paymentLink);
                saved = orderRepository.save(saved);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not generation MP Payment link: " + e.getMessage());
        }

        whatsAppService.sendOrderNotification(saved);

        // Trigger generic notifications (Async ideally, but sync for now)
        try {
            emailService.sendOrderNotification(saved); // Admin email
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }

        try {
            pushNotificationService.sendOrderNotification(saved);
        } catch (Exception e) {
            System.err.println("Error sending push: " + e.getMessage());
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect username or password");
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
