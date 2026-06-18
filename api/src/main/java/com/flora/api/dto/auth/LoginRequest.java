package com.flora.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Enter a valid 10-digit Indian mobile number"
    )
    private String phoneNumber;
    // "9876543210"
    // Same validation as RegisterRequest
    // If wrong format → rejected before even hitting the database

    @NotBlank(message = "Password is required")
    private String password;
    // "gowtham123"
    // No @Size here — if they registered with a valid password
    // we trust the length. Just check it is not blank.
    // BCrypt comparison happens in AuthService
}
