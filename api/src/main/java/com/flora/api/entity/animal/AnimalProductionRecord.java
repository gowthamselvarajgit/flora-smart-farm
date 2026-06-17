package com.flora.api.entity.animal;

import com.flora.api.enums.animal.ProductionSession;
import com.flora.api.enums.animal.RecordType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "animal_production_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnimalProductionRecord {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "production_record_id")
    private Long productionRecordId;

    //Which Animal
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    //RecordType
    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false, length = 20)
    private RecordType recordType;

    //When
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "session", nullable = false, length = 10)
    private ProductionSession session;

    //Actual Measurement
    @Column(name = "quantity", nullable = false)
    private Double quantity;

    //Drop Detection
    @Column(name = "is_drop_detected", nullable = false)
    private Boolean isDropDetected = false;

    //Harvest Context
    @Column(name = "harvest_cycle", length = 100)
    private String harvestCycle;

    //Optional Notes
    @Column(name = "notes", length = 500)
    private String notes;

    //Timestamp
    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();
}
