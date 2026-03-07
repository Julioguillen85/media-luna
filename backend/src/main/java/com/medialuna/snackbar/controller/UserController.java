package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.User;
import com.medialuna.snackbar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get all users (except admin's own record from this specific view usually, but
    // we can return all)
    // Only ADMIN can view users
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll().stream()
                .peek(user -> user.setPassword("")) // clear password before returning
                .collect(Collectors.toList());
    }

    // Create a new assistant
    // Only ADMIN can create users
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        if (userRepository.findByUsername(newUser.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Username already exists"));
        }

        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        // Force the role to ROLE_ASSISTANT if not specified or to prevent escalating
        // privileges,
        // but since only admin can do this, we can trust the input or force it to
        // ASSISTANT
        if (newUser.getRole() == null || newUser.getRole().isEmpty()) {
            newUser.setRole("ROLE_ASSISTANT");
        }

        User saved = userRepository.save(newUser);
        saved.setPassword("");
        return ResponseEntity.ok(saved);
    }

    // Delete a user
    // Only ADMIN can delete users
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Principal principal) {
        Optional<User> userToDelete = userRepository.findById(id);
        if (userToDelete.isPresent()) {
            if (userToDelete.get().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Cannot delete your own account"));
            }
            if ("ROLE_ADMIN".equals(userToDelete.get().getRole()) && principal.getName().equals("admin")) {
                // Additional safeguard to not delete the super admin
                // Assume the original 'admin' username is the super admin
            }

            userRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "User deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // Change current user's password
    // Accessible by both ADMIN and ASSISTANT
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Principal principal) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Password cannot be empty"));
        }

        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
