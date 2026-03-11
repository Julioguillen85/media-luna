package com.medialuna.snackbar.config;

import com.medialuna.snackbar.model.User;
import com.medialuna.snackbar.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        return args -> {
            var optAdmin = userRepository.findByUsername("admin");
            if (optAdmin.isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
                System.out.println("Default admin user created: admin / admin123");
            } else {
                User admin = optAdmin.get();
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
                System.out.println("Default admin user password reset to: admin / admin123");
            }

            // Automate PostgreSQL sequence repair to resolve duplicate key errors caused by older destructive updates
            try {
                jdbcTemplate.execute("SELECT setval('price_tiers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM price_tiers))");
                System.out.println("✅ PostgreSQL Sequence 'price_tiers_id_seq' synchronized successfully.");
            } catch (Exception e) {
                System.err.println("⚠️ Could not synchronize 'price_tiers_id_seq'. Ensure you are using PostgreSQL.");
            }
        };
    }
}
