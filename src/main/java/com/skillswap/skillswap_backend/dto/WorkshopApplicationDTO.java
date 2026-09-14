package com.skillswap.skillswap_backend.dto;

import com.skillswap.skillswap_backend.entity.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkshopApplicationDTO {

    private Long id;

    private Long workshopId;
    private String workshopTitle;
    private String teacherName;
    private String teacherEmail;
    private LocalDateTime workshopDateTime;
    private String location;

    private Long learnerId;
    private String learnerName;
    private String learnerEmail;

    private ApplicationStatus status;

    private LocalDateTime appliedAt;
}