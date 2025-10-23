package com.hatcast.infrastructure.security;

import com.hatcast.domain.model.User;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class FirebaseAuthenticationToken extends AbstractAuthenticationToken {
    
    private final User user;
    private final String token;
    
    public FirebaseAuthenticationToken(User user, String token, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.user = user;
        this.token = token;
        setAuthenticated(true);
    }
    
    @Override
    public Object getCredentials() {
        return token;
    }
    
    @Override
    public Object getPrincipal() {
        return user;
    }
    
    public User getUser() {
        return user;
    }
}