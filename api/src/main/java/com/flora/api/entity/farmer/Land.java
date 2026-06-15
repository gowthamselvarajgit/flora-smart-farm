package com.flora.api.entity.farmer;

import com.flora.api.entity.crop.Crop;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lands")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Land {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "land_id")
    private Long landId;

    //who owns this land
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    //where is the land
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    //Land details
    @Column(name = "land_name", length = 100)
    private String landName;

    @Column(name = "size_acres", nullable = false)
    private Double sizeAcres;

    @Column(name = "soil_type", length = 100)
    private String soilType;

    //what is currently growing in land
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "land_crops",
            joinColumns = @JoinColumn(name = "land_id"),
            inverseJoinColumns = @JoinColumn(name = "crop_id")
    )
    private List<Crop> currentCrops;

    //Is this land active
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    //Timestamps
    @Column(name = "created_at", nullable = false, unique = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();


}
