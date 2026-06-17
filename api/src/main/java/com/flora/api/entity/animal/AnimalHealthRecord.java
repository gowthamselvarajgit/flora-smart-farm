package com.flora.api.entity.animal;

import com.flora.api.enums.animal.HealthStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "animal_health_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnimalHealthRecord {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "health_record_id")
    private Long healthRecordId;

    //Which Animal
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    //Symptoms entered by farmers
    @Column(name = "symptoms_json", nullable = false, columnDefinition = "TEXT")
    private String symptomsJson;

    //Additional Symptoms
    @Column(name = "additional_notes", length = 1000)
    private String additionalNotes;

    //AI prediction results
    @Column(name = "predicted_disease", length = 200)
    private String predictedDisease;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private HealthStatus severity;

    //Action
    @Column(name = "action_required", length = 500)
    private String actionRequired;

    @Column(name = "is_vet_visit_required", nullable = false)
    private Boolean isVetVisitRequired = false;

    //Was this acted upon
    @Column(name = "is_resolved", nullable = false)
    private Boolean isResolved = false;

    //TimeStamp
    @Column(name = "checked_at", nullable = false, updatable = false)
    private LocalDateTime checkedAt = LocalDateTime.now();
}
