package com.flora.api.entity.animal;

import com.flora.api.enums.animal.VaccinationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccination_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationRecord {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vaccination_record_id")
    private Long vaccinationRecordId;

    //Which Animal
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    //Vaccine details
    @Column(name = "vaccine_name", nullable = false, length = 200)
    private String vaccineName;

    @Column(name = "vaccine_name_tamil", length = 200)
    private String vaccineNameTamil;

    @Column(name = "vaccine_name_hindi", length = 200)
    private String vaccineNameHindi;

    @Column(name = "disease_protected_against", length = 200)
    private String diseaseProtectedAgainst;

    //Schedule
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "administered_date")
    private LocalDate administeredDate;

    //Who administered
    @Column(name = "administered_by", length = 200)
    private String administeredBy;

    //status
    @Enumerated(EnumType.STRING)
    @Column(name = "vaccination_status", nullable = false, length = 20)
    private VaccinationStatus vaccinationStatus = VaccinationStatus.PENDING;

    //Notes
    @Column(name = "notes", length = 500)
    private String notes;

    //Timestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    //Auto-refresh updated_at on every change
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
