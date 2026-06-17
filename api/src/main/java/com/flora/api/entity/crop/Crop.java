package com.flora.api.entity.crop;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "crops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crop_id")
    private Long cropId;

    @Column(name = "crop_name", nullable = false, unique = true, length = 100)
    private String cropName;

    @Column(name = "crop_name_tamil", length = 100)
    private String cropNameTamil;

    @Column(name = "crop_name_hindi", length = 100)
    private String cropNameHindi;

    @Column(name = "crop_season", length = 50)
    private String cropSeason;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
