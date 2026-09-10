package com.skillswap.skillswap_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

        @NotBlank(message = "Description is required")
    @Column(columnDefinition = "TEXT")
    private String description;

    @Min(value = 0, message = "Experience years cannot be negative")

    
    @Max(value = 50, message = "Experience years seems too high")
    private Integer experienceYears;

    @NotBlank(message = "Location is required")
    private String location;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}