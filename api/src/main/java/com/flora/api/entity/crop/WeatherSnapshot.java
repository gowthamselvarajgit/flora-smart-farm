package com.flora.api.entity.crop;

import com.flora.api.entity.farmer.District;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "weather_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherSnapshot {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weather_snapshot_id")
    private Long weatherSnapshotId;

    //Linked to which scan
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false, unique = true)
    private SoilScan soilScan;

    //current weather
    @Column(name = "temperature_celsius")
    private Double temperatureCelsius;

    @Column(name = "feels_like_celsius")
    private Double feelsLikeCelsius;

    @Column(name = "humidity_percent")
    private Double humidityPercent;

    @Column(name = "rainfall_mm")
    private Double rainfallMm;

    @Column(name = "wind_speed_kmh")
    private Double windSpeedKmh;

    @Column(name = "weather_description", length = 100)
    private String weatherDescription;

    @Column(name = "weather_icon_code", length = 20)
    private String weatherIconCode;

    //7 days forecastJson
    @Column(name = "forecast_json", columnDefinition = "TEXT")
    private String forecastJson;

    //timestamp
    @Column(name = "fetched_at", nullable = false, updatable = false)
    private LocalDateTime fetchedAt = LocalDateTime.now();

}