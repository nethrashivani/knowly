package com.skillswap.skillswap_backend.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {

    private Long id;

    private String name;

    private String email;

    private String role;

    private Long userId;
    

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    @Size(max = 1000, message = "Skills wanted cannot exceed 1000 characters")
    private String skillsWanted;
}