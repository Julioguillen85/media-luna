package com.medialuna.snackbar.controller;
import com.medialuna.snackbar.model.*;
import com.medialuna.snackbar.repository.*;
import com.medialuna.snackbar.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    @Autowired private ProductRepository productRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OptionsRepository optionsRepository;
    @Autowired private WhatsAppService whatsAppService;

    @GetMapping("/products")
    public List<Product> getProducts() { return productRepository.findAll(); }
    
    @PostMapping("/products")
    public Product saveProduct(@RequestBody Product product) { return productRepository.save(product); }
    
    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) { productRepository.deleteById(id); }

    @GetMapping("/orders")
    public List<CustomerOrder> getOrders() { return orderRepository.findAll(); }
    
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
        whatsAppService.sendOrderNotification(saved);
        return saved;
    }

    @GetMapping("/options")
    public IngredientOptions getOptions() { return optionsRepository.findById(1L).orElse(new IngredientOptions()); }
    
    @PostMapping("/options")
    public IngredientOptions updateOptions(@RequestBody IngredientOptions options) {
        options.setId(1L);
        return optionsRepository.save(options);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> creds) {
        if ("admin123".equals(creds.get("password"))) return Map.of("success", true);
        return Map.of("success", false);
    }
}
