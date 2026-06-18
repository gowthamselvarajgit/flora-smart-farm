package com.flora.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    // "eyJhbGciOiJIUzI1NiJ9..."
    // Short-lived JWT — 15 minutes
    // App sends this in every API request header:
    // Authorization: Bearer eyJhbGci...

    private String refreshToken;
    // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    // Long-lived UUID — 90 days
    // App uses this silently to get a new access token
    // when the 15-minute access token expires

    private Long farmerId;
    // 1
    // App stores this locally
    // Used to build API URLs like /api/farmer/1/dashboard

    private String firstName;
    // "Gowtham"
    // App shows "Welcome, Gowtham" on dashboard immediately
    // No extra API call needed just to show the name

    private String preferredLanguage;
    // "Gowtham"
    // App shows "Welcome, Gowtham" on dashboard immediately
    // No extra API call needed just to show the name

}
