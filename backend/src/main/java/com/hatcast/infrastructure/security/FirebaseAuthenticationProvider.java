package com.hatcast.infrastructure.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.hatcast.domain.model.User;
import com.hatcast.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class FirebaseAuthenticationProvider implements AuthenticationProvider {
    
    private final FirebaseAuth firebaseAuth;
    private final UserRepository userRepository;
    
    @Autowired
    public FirebaseAuthenticationProvider(FirebaseAuth firebaseAuth, UserRepository userRepository) {
        this.firebaseAuth = firebaseAuth;
        this.userRepository = userRepository;
    }
    
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String token = (String) authentication.getCredentials();
        
        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
            String uid = decodedToken.getUid();
            
            // Find user in our database
            Optional<User> user = userRepository.findById(uid);
            if (user.isEmpty()) {
                throw new BadCredentialsException("User not found in database");
            }
            
            return new FirebaseAuthenticationToken(user.get(), token, user.get().getAuthorities());
            
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid Firebase token", e);
        }
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        return FirebaseAuthenticationToken.class.isAssignableFrom(authentication);
    }
}