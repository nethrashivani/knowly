package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.UserProfileDTO;
import com.skillswap.knowly_backend.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                userProfileService.getMyProfile(email)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                userProfileService.getUserProfile(userId)
        );
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileDTO dto) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                userProfileService.updateMyProfile(email, dto)
        );
    }
}