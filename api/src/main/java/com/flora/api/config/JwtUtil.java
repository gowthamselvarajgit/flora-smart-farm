package com.flora.api.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;
    // Read from .env → JWT_SECRET
    // Never hardcoded here

    @Value("${jwt.expiration}")
    private long jwtExpiration;
    // 900000ms = 15 minutes

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    // 7776000000ms = 90 days

    // ═══════════════════════════════════════════
    // GENERATE ACCESS TOKEN
    // ═══════════════════════════════════════════

    public String generateAccessToken(UserDetails userDetails) {
        return generateAccessToken(new HashMap<>(), userDetails);
    }

    public String generateAccessToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails) {

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                // Subject = farmer's phone number: "9876543210"

                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                // Expires in 15 minutes

                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                // Signed with our secret key
                // Any tampering → signature fails → token rejected

                .compact();
    }

    // ═══════════════════════════════════════════
    // GENERATE REFRESH TOKEN
    // ═══════════════════════════════════════════

    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
        // Simple random UUID string — not a JWT
        // Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        // Stored in refresh_tokens table
        // App sends this back when access token expires
    }

    // ═══════════════════════════════════════════
    // VALIDATE ACCESS TOKEN
    // ═══════════════════════════════════════════

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        final String phoneNumber = extractPhoneNumber(token);
        return (phoneNumber.equals(userDetails.getUsername()))
                && !isTokenExpired(token);
        // Valid if:
        // 1. Phone number in token matches farmer loaded from DB
        // 2. Token has not expired
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
        // Expiry date in token is before right now → expired
    }

    // ═══════════════════════════════════════════
    // EXTRACT DATA FROM ACCESS TOKEN
    // ═══════════════════════════════════════════

    public String extractPhoneNumber(String token) {
        return extractClaim(token, Claims::getSubject);
        // Subject = phone number we stored when generating token
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                // Verify signature using our secret key
                // Tampered token → exception thrown → request rejected
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
        // Convert secret string to cryptographic key
    }
}