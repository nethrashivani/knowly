package com.skillswap.knowly_backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillDTO {

    private Long id;
    private Long ownerId;
    private String ownerEmail;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Instructor name is required")
    private String instructorName;

    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 50, message = "Experience years seems too high")
    private Integer experienceYears;

    @NotBlank(message = "Location is required")
    private String location;

    private java.time.LocalDateTime createdAt;
}
