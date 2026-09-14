package com.skillswap.skillswap_backend.controller;

import com.skillswap.skillswap_backend.dto.RatingDTO;
import com.skillswap.skillswap_backend.service.RatingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@SecurityRequirement(name = "bearerAuth")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    public ResponseEntity<RatingDTO> createRating(
            Authentication authentication,
            @Valid @RequestBody RatingDTO dto) {

        String reviewerEmail = authentication.getName();

        return ResponseEntity.ok(
                ratingService.createRating(reviewerEmail, dto)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingDTO>> getRatingsForUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                ratingService.getRatingsForUser(userId)
        );
    }
}