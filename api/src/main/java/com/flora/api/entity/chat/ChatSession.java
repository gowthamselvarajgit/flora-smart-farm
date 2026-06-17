package com.flora.api.entity.chat;

import com.flora.api.entity.animal.Animal;
import com.flora.api.entity.animal.AnimalHealthRecord;
import com.flora.api.entity.farmer.Farmer;
import com.flora.api.enums.chat.ChatCategory;
import com.flora.api.enums.chat.ChatStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSession {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    //who started this chat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    //Category
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private ChatCategory category;

    //Context
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_record_id")
    private AnimalHealthRecord healthRecord;

    //Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ChatStatus status = ChatStatus.OPEN;

    //Title
    @Column(name = "title", length = 200)
    private String title;

    //Rating
    @Column(name = "farmer_rating")
    private Integer farmerRating;

    @Column(name = "farmer_feedback", length = 500)
    private String farmerFeedback;

    //Timestamp
    @Column(name = "opened_at", nullable = false, updatable = false)
    private LocalDateTime openedAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;


}
