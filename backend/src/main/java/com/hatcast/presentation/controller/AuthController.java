package com.hatcast.presentation.controller;

import com.hatcast.application.service.UserService;
import com.hatcast.domain.model.User;
import com.hatcast.infrastructure.security.FirebaseAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserService userService;
    
    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(@RequestBody Map<String, String> request) {
        // This endpoint is used by the frontend to verify tokens
        // The actual verification happens in the security filter
        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("message", "Token verification handled by security filter");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/current-user")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        if (authentication instanceof FirebaseAuthenticationToken) {
            FirebaseAuthenticationToken token = (FirebaseAuthenticationToken) authentication;
            User user = token.getUser();
            return ResponseEntity.ok(user);
        }
        
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/update-profile")
    public ResponseEntity<User> updateProfile(@RequestBody User userUpdate, Authentication authentication) {
        if (authentication instanceof FirebaseAuthenticationToken) {
            FirebaseAuthenticationToken token = (FirebaseAuthenticationToken) authentication;
            User currentUser = token.getUser();
            
            // Update only allowed fields
            currentUser.setDisplayName(userUpdate.getDisplayName());
            currentUser.setPhotoURL(userUpdate.getPhotoURL());
            currentUser.setPhone(userUpdate.getPhone());
            if (userUpdate.getPreferences() != null) {
                currentUser.setPreferences(userUpdate.getPreferences());
            }
            
            User updatedUser = userService.updateUser(currentUser.getId(), currentUser);
            return ResponseEntity.ok(updatedUser);
        }
        
        return ResponseEntity.badRequest().build();
    }
}