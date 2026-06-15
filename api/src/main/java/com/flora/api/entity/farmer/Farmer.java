package com.flora.api.entity.farmer;

import com.flora.api.entity.animal.AnimalType;
import com.flora.api.entity.crop.Crop;
import com.flora.api.enums.farmer.Language;
import com.flora.api.enums.farmer.PrimaryActivity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "farmers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Farmer {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "farmer_id")
    private Long farmerId;

    //Authentication
    @Column(name = "phone_number", unique = true, nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "hashed_password", nullable = false)
    private String hashedPassword;

    //Basic Profile
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    //Onboarding Q1
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_language", nullable = false, length = 10)
    private Language preferredLanguage = Language.EN;

    //Onboarding Q2
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    //Onboarding Q3
    @Enumerated(EnumType.STRING)
    @Column(name = "primary_activity", nullable = false, length = 10)
    private PrimaryActivity primaryActivity = PrimaryActivity.CROP;

    // --- Onboarding Q4 ---
    // Land size and crops moved to Land entity
    // Farmer can have multiple lands in different districts

    // --- Onboarding Q5 ---
    // currentlyGrowingCrops moved to Land entity
    // Each land tracks its own crops independently

    //Onboarding Q6
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "farmer_animal_types",
            joinColumns = @JoinColumn(name = "farmer_id"),
            inverseJoinColumns = @JoinColumn(name = "animal_type_id")
    )
    private List<AnimalType> ownedAnimalTypes;

    //Onboarding Q7
    @Column(name = "alert_time")
    private LocalTime alertTime;

    //App State
    @Column(name = "is_onboarding_complete", nullable = false)
    private Boolean isOnboardingComplete = false;

    // --- Timestamps ---
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // --- Helper ---
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
