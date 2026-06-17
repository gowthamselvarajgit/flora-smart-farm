package com.flora.api.entity.feedback;

import com.flora.api.entity.crop.Prediction;
import com.flora.api.entity.farmer.Farmer;
import com.flora.api.enums.feedback.FeedbackType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    //who gave this feedback
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    //what type of feedback
    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_type", nullable = false, length = 20)
    private FeedbackType feedbackType;

    //which prediction this feedback is about
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id")
    private Prediction prediction;

    //Rating
    @Column(name = "rating", nullable = false)
    private Integer rating;

    //what actually happend
    @Column(name = "actual_crop_grown", length = 100)
    private String actualCropGrown;

    @Column(name = "actual_yield_kg")
    private Double actualYieldKg;

    //Comments;
    @Column(name = "comments", length = 1000)
    private String comments;

    //Timestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();
}
