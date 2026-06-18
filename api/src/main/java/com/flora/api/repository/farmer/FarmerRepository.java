package com.flora.api.repository.farmer;

import com.flora.api.entity.farmer.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    Optional<Farmer> findByPhoneNumber (String phoneNumber);
    // Spring reads the method name and auto-generates this SQL:
    // SELECT * FROM farmers WHERE phone_number = ?
    // Returns Optional — empty if no farmer found with that number

    Boolean existsByPhoneNumber(String phoneNumber);
    // SELECT COUNT(*) FROM farmers WHERE phone_number = ?
    // Returns true if phone already registered
    // Used during registration to prevent duplicates

}
