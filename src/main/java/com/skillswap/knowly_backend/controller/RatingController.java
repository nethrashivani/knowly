package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.RatingDTO;
import com.skillswap.knowly_backend.service.RatingService;
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
    public ResponseEntity<RatingDTO> createRating(Authentication authentication, @Valid @RequestBody RatingDTO dto) {
        return ResponseEntity.ok(ratingService.createRating(authentication.getName(), dto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingDTO>> getRatingsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ratingService.getRatingsForUser(userId));
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<RatingDTO>> getRatingsForWorkshop(@PathVariable Long workshopId) {
        return ResponseEntity.ok(ratingService.getRatingsForWorkshop(workshopId));
    }

    @GetMapping("/workshop/{workshopId}/mine")
    public ResponseEntity<RatingDTO> getMyRatingForWorkshop(Authentication authentication, @PathVariable Long workshopId) {
        return ResponseEntity.ok(ratingService.getMyRatingForWorkshop(authentication.getName(), workshopId));
    }
}