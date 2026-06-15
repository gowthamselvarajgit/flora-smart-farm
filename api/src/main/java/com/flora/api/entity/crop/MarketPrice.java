package com.flora.api.entity.crop;

import com.flora.api.entity.farmer.District;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Stack;

@Entity
@Table(name = "market_prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketPrice {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "market_price_id")
    private Long marketPriceId;

    //Which crop
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    //Which District
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    //price data
    @Column(name = "price_per_quintal", nullable = false)
    private Double pricePerQuintal;

    @Column(name = "min_price")
    private Double minPrice;

    @Column(name = "max_price")
    private Double maxPrice;

    @Column(name = "modal_price")
    private Double modalPrice;

    //Date
    @Column(name = "price_date", nullable = false)
    private LocalDate priceDate;

    //source
    @Column(name = "mandi_name", length = 200)
    private String mandiName;

    @Column(name = "source", length = 100)
    private String source;

    //TimeStamp
    @Column(name = "fetched_at", nullable = false, updatable = false)
    private LocalDateTime fetchedAt = LocalDateTime.now();
}
