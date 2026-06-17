package com.flora.api.entity.chat;

import com.flora.api.enums.chat.SenderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    //Identity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    //Which Session this message belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession chatSession;

    //Who sent this message
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 10)
    private SenderType senderType;

    //The message itself
    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    //Was it read
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    //Attachments
    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    //Timestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt = LocalDateTime.now();
}
