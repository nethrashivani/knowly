package com.skillswap.knowly_backend.dto;

import com.skillswap.skillswap_backend.entity.User;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private User.Role role;
}