package com.flora.api.entity.alert;

import com.flora.api.entity.farmer.Farmer;
import com.flora.api.enums.alert.AlertSeverity;
import com.flora.api.enums.alert.AlertType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    //Who this alert belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    //What type of alert
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 30)
    private AlertType alertType;

    //How serious is it
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 10)
    private AlertSeverity severity;

    //The alert content
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "action_label", length = 100)
    private String actionLabel;

    @Column(name = "action_deep_link", length = 200)
    private String actionDeepLink;

    //Was it read
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    //Was push notification sent
    @Column(name = "is_push_sent", nullable = false)
    private Boolean isPushSent = false;

    //Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "read_at")
    private LocalDateTime readAt;

}
