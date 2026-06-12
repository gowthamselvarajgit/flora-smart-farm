package com.flora.api.entity.animal;

import com.flora.api.entity.farmer.Farmer;
import com.flora.api.enums.animal.AnimalGender;
import com.flora.api.enums.animal.HealthStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(name = "animals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Animal {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "animal_id")
    private Long animalId;

    //Owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    //Type
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_type_id", nullable = false)
    private AnimalType animalType;

    //Breed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "breed_id")
    private Breed breed;

    //Basic Details
    @Column(name = "animal_name", length = 100)
    private String animalName;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private AnimalGender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "weight_kg")
    private Double weightKg;

    //Health
    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", nullable = false, length = 20)
    private HealthStatus healthStatus = HealthStatus.HEALTHY;

    //Government Tag
    @Column(name = "unique_tag_number", unique = true, length = 50)
    private String uniqueTagNumber;

    //TimeStamps
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

}
