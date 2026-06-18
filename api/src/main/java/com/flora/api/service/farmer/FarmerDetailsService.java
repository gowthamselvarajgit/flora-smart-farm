package com.flora.api.service.farmer;

import org.springframework.security.core.userdetails.UserDetailsService;

public interface FarmerDetailsService extends UserDetailsService {
    // Extends Spring Security's UserDetailsService
    // Inherits one method:
    // UserDetails loadUserByUsername(String username)
    //
    // Spring Security calls this automatically when validating a JWT token
    // It passes the phone number extracted from the token
    // We look up the farmer in the database and return them
    //
    // Why an interface?
    // Tomorrow if we want to load farmers from cache instead of DB
    // we just write a new implementation — nothing else changes
}
