package com.skillswap.skillswap_backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkshopDTO {

    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Future
    private LocalDateTime dateTime;

    @NotBlank
    private String location;

    @NotNull
    @Min(1)
    private Integer capacity;

    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
}