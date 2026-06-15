package com.flora.api.entity.crop;

import com.flora.api.entity.farmer.Farmer;
import com.flora.api.entity.farmer.Land;
import com.flora.api.enums.crop.CropSeason;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "soil_scans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoilScan {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scan_id")
    private Long scanId;

    //Who submitted this scan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_id", nullable = false)
    private Land land;

    //primary macronutrients
    @Column(name = "nitrogen", nullable = false)
    private Double nitrogen;

    @Column(name = "phosphorus", nullable = false)
    private Double phosphorus;

    @Column(name = "potassium", nullable = false)
    private Double potassium;

    //Soil properties

    @Column(name = "ph_level", nullable = false)
    private Double phLevel;

    @Column(name = "moisture", nullable = false)
    private Double moisture;

    @Column(name = "electrical_conductivity")
    private Double electricalConductivity;

    @Column(name = "organic_carbon")
    private Double organicCarbon;

    //secondary macronutrients
    @Column(name = "sulphur")
    private Double sulphur;

    @Column(name = "calcium")
    private Double calcium;

    @Column(name = "magnesium")
    private Double magnesium;

    @Column(name = "zinc")
    private Double zinc;

    @Column(name = "iron")
    private Double iron;

    @Column(name = "manganese")
    private Double manganese;

    @Column(name = "boron")
    private Double boron;

    @Column(name = "copper")
    private Double copper;

    //season and metadata
    @Enumerated(EnumType.STRING)
    @Column(name = "season", length = 20)
    private CropSeason season;

    @Column(name = "is_mock_data", nullable = false)
    private Boolean isMockData = false;

    //Timestamp
    @Column(name = "scanned_at", nullable = false, updatable = false)
    private LocalDateTime scannedAt = LocalDateTime.now();


}