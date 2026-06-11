package com.flora.api.entity.animal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "animal_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnimalType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "animal_type_id")
    private Long animalTypeId;

    @Column(name = "type_name", nullable = false, unique = true, length = 50)
    private String typeName;

    @Column(name = "type_name_tamil", length = 50)
    private String typeNameTamil;

    @Column(name = "type_name_hindi", length = 50)
    private String typeNameHindi;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "lottie_url", length = 500)
    private String lottieUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

}
