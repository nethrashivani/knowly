package com.skillswap.skillswap_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "skill_interests",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"skill_id", "learner_id"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SkillInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @Column(nullable = false)
    private LocalDateTime createdAt;


}