package com.flora.api.entity.crop;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prediction_id")
    private Long predictionId;

    // Input
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false, unique = true)
    private SoilScan soilScan;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weather_snapshot_id", nullable = false)
    private WeatherSnapshot weatherSnapshot;

    //MODEL 1 - CROP RECOMMENDATION

    @Column(name = "recommended_crop_1", length = 100)
    private String recommendedCrop1;

    @Column(name = "crop_1_confidence")
    private Double crop1Confidence;

    @Column(name = "recommended_crop_2", length = 100)
    private String recommendedCrop2;

    @Column(name = "crop_2_confidence")
    private Double crop2Confidence;

    @Column(name = "recommended_crop_3", length = 100)
    private String recommendedCrop3;

    @Column(name = "crop_3_confidence")
    private Double crop3Confidence;

    @Column(name = "crop_recommendation_reason", length = 1000)
    private String cropRecommendationReason;

    //MODEL 2 - FERTILIZER CALCULATOR

    @Column(name = "urea_kg_per_acre")
    private Double ureaKgPerAcre;

    @Column(name = "dap_kg_per_acre")
    private Double dapKgPerAcre;

    @Column(name = "mop_kg_per_acre")
    private Double mopKgPerAcre;

    @Column(name = "fertilizer_schedule", length = 1000)
    private String fertilizerSchedule;

    //MODEL 3 - DISEASE RISK ALERT

    @Column(name = "disease_risk_level", length = 20)
    private String diseaseRiskLevel;

    @Column(name = "disease_name", length = 200)
    private String diseaseName;

    @Column(name = "disease_action", length = 500)
    private String diseaseAction;

    //MODEL 4 - Irrigation Advisor

    @Column(name = "days_until_irrigation")
    private Integer daysUntilIrrigation;

    @Column(name = "irrigation_volume_mm")
    private Double irrigationVolumeMm;

    @Column(name = "irrigation_advice", length = 500)
    private String irrigationAdvice;

    //MODEL 5 - Market Price Predictor

    @Column(name = "predicted_price_json", columnDefinition = "TEXT")
    private String predictedPriceJson;

    @Column(name = "best_sell_window_start")
    private LocalDateTime bestSellWindowStart;

    @Column(name = "best_sell_window_end")
    private LocalDateTime bestSellWindowEnd;

    @Column(name = "price_advice", length = 500)
    private String priceAdvice;

    //Metadata
    @Column(name = "flask_response_time_ms")
    private Long flaskResponseTimeMs;

    @Column(name = "predicted_at", nullable = false, unique = false)
    private LocalDateTime predictedAt = LocalDateTime.now();

}
