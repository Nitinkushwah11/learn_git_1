package com.stockpro.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey key;

    // ✅ Build the key once at startup
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ✅ Generate Token
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)                         
                .claim("role", role)
                .issuedAt(new Date())                    
                .expiration(new Date(System.currentTimeMillis() + expiration)) 
                .signWith(key)                          
                .compact();
    }

    // ✅ Validate Token
    public boolean validateToken(String token) {
        try {
            Jwts.parser()                                
                    .verifyWith(key)                     
                    .build()
                    .parseSignedClaims(token);           
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ✅ Extract Email
    public String extractEmail(String token) {
        return Jwts.parser()                            
                .verifyWith(key)                         
                .build()
                .parseSignedClaims(token)                
                .getPayload()                            
                .getSubject();
    }
}