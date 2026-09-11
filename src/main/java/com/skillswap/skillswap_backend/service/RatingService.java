package com.skillswap.skillswap_backend.service;

import com.skillswap.skillswap_backend.dto.RatingDTO;
import com.skillswap.skillswap_backend.entity.Rating;
import com.skillswap.skillswap_backend.entity.User;
import com.skillswap.skillswap_backend.repository.RatingRepository;
import com.skillswap.skillswap_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    public RatingService(
            RatingRepository ratingRepository,
            UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
    }

    public RatingDTO createRating(String reviewerEmail, RatingDTO dto) {

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        User ratedUser = userRepository.findById(dto.getRatedUserId())
                .orElseThrow(() -> new RuntimeException("Rated user not found"));

        if (reviewer.getId().equals(ratedUser.getId())) {
            throw new RuntimeException("You cannot rate yourself");
        }

        if (ratingRepository.existsByReviewer_IdAndRatedUser_Id(
                reviewer.getId(), ratedUser.getId())) {
            throw new RuntimeException("You have already rated this user");
        }

        Rating rating = Rating.builder()
                .reviewer(reviewer)
                .ratedUser(ratedUser)
                .rating(dto.getRating())
                .review(dto.getReview())
                .build();

        return convertToDTO(ratingRepository.save(rating));
    }

    public List<RatingDTO> getRatingsForUser(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        return ratingRepository.findByRatedUser_Id(userId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    private RatingDTO convertToDTO(Rating rating) {

        User reviewer = rating.getReviewer();

        return RatingDTO.builder()
                .id(rating.getId())
                .ratedUserId(rating.getRatedUser().getId())
                .reviewerName(reviewer.getName())
                .reviewerEmail(reviewer.getEmail())
                .rating(rating.getRating())
                .review(rating.getReview())
                .createdAt(rating.getCreatedAt().toString())
                .build();
    }
}