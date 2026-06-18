package com.flora.api.entity.farmer;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_id")
    private Long refreshTokenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;
    // MANY refresh tokens belong to ONE farmer
    // Gowtham logged in on 2 phones = 2 separate refresh tokens
    // Each device gets its own independent token

    @Column(name = "token", nullable = false, unique = true, columnDefinition = "TEXT")
    private String token;
    // UUID string: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    // unique = true — no two devices share the same token
    // App stores this and sends it when access token expires

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    // 90 days from creation
    // After this → token invalid → farmer must login again

    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked = false;
    // false → valid, can be used to get new access tokens
    // true  → farmer logged out, this token is dead
    // Even if stolen → once revoked → completely useless

    @Column(name = "device_info", length = 200)
    private String deviceInfo;
    // "Samsung Galaxy A23 — Android 13"
    // Optional — shown in active sessions screen later
    // Nullable

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    //Updated every time this token is used to get a new access token
    // If not used for 30 days → auto revoke as security measure

}
