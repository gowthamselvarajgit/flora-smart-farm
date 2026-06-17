package com.flora.api.entity.animal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "breeds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Breed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "breed_id")
    private Long breedId;

    @Column(name = "breed_name", nullable = false, length = 100)
    private String breedName;

    @Column(name = "breed_name_tamil", length = 100)
    private String breedNameTamil;

    @Column(name = "breed_name_hindi", length = 100)
    private String breedNameHindi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_type_id", nullable = false)
    private AnimalType animalType;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
