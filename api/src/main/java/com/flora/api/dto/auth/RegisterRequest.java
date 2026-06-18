package com.flora.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.Normalized;

@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    // "Gowtham"
    // @NotBlank → cannot be empty or just spaces
    // @Size → must be between 2 and 50 characters

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    //"Selvaraj"

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Enter a valid 10-digit Indian mobile number"
    )
    private String phoneNumber;
    // "9876543210"
    // @Pattern → must match Indian mobile number format
    // ^[6-9] → must start with 6, 7, 8, or 9
    // \\d{9}$ → followed by exactly 9 more digits
    // Total = 10 digits. All Indian mobile numbers follow this.
    // "9876543210" ✅   "1234567890" ❌   "98765" ❌

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    // "gowtham123"
    // Never stored as plain text
    // BCrypt hashed before saving to DB
    // "gowtham123" → "$2a$10$xyz..." (irreversible)
}
