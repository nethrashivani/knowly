package com.skillswap.knowly_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "workshops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workshop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false)
    private String location;

    @Column(length = 1000)
    private String meetingUrl;

    @Column(nullable = true)
    private Integer capacity;

    @Column(nullable = false)
    @Builder.Default
    private boolean requiresAcceptance = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;
}
