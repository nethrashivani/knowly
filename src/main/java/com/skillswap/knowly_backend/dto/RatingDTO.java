package com.skillswap.knowly_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDTO {

    private Long id;

    private Long ratedUserId;

    private Long workshopId;

    private String reviewerName;

    private String reviewerEmail;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot be more than 5")
    private Integer rating;

    @Size(max = 1000, message = "Review cannot exceed 1000 characters")
    private String review;

    private String createdAt;
}