package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.RatingDTO;
import com.skillswap.knowly_backend.entity.ApplicationStatus;
import com.skillswap.knowly_backend.entity.Rating;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.entity.Workshop;
import com.skillswap.knowly_backend.entity.WorkshopApplication;
import com.skillswap.knowly_backend.repository.RatingRepository;
import com.skillswap.knowly_backend.repository.UserRepository;
import com.skillswap.knowly_backend.repository.WorkshopApplicationRepository;
import com.skillswap.knowly_backend.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final WorkshopApplicationRepository workshopApplicationRepository;

    public RatingService(RatingRepository ratingRepository, UserRepository userRepository, WorkshopRepository workshopRepository, WorkshopApplicationRepository workshopApplicationRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.workshopApplicationRepository = workshopApplicationRepository;
    }

    public RatingDTO createRating(String reviewerEmail, RatingDTO dto) {
        User reviewer = userRepository.findByEmail(reviewerEmail).orElseThrow(() -> new RuntimeException("Reviewer not found"));
        Workshop workshop = workshopRepository.findById(dto.getWorkshopId()).orElseThrow(() -> new RuntimeException("Workshop not found"));
        User ratedUser = workshop.getTeacher();

        if (reviewer.getId().equals(ratedUser.getId())) throw new RuntimeException("You cannot rate your own workshop");
        if (!workshop.getDateTime().isBefore(LocalDateTime.now())) throw new RuntimeException("You can only rate a workshop after it has happened");

        WorkshopApplication application = workshopApplicationRepository.findByWorkshop_IdAndLearner_Id(workshop.getId(), reviewer.getId())
                .orElseThrow(() -> new RuntimeException("You have not joined this workshop"));
        if (application.getStatus() != ApplicationStatus.ACCEPTED) throw new RuntimeException("Only enrolled learners can rate a workshop");
        if (ratingRepository.existsByReviewer_IdAndWorkshop_Id(reviewer.getId(), workshop.getId())) throw new RuntimeException("You have already rated this workshop");

        Rating rating = Rating.builder()
                .reviewer(reviewer)
                .ratedUser(ratedUser)
                .workshop(workshop)
                .rating(dto.getRating())
                .review(dto.getReview())
                .build();
        return convertToDTO(ratingRepository.save(rating));
    }

    public List<RatingDTO> getRatingsForUser(Long userId) {
        if (!userRepository.existsById(userId)) throw new RuntimeException("User not found");
        return ratingRepository.findByRatedUser_Id(userId).stream().map(this::convertToDTO).toList();
    }

    public List<RatingDTO> getRatingsForWorkshop(Long workshopId) {
        if (!workshopRepository.existsById(workshopId)) throw new RuntimeException("Workshop not found");
        return ratingRepository.findByWorkshop_IdOrderByCreatedAtDesc(workshopId).stream().map(this::convertToDTO).toList();
    }

    public RatingDTO getMyRatingForWorkshop(String reviewerEmail, Long workshopId) {
        User reviewer = userRepository.findByEmail(reviewerEmail).orElseThrow(() -> new RuntimeException("Reviewer not found"));
        return ratingRepository.findByReviewer_IdAndWorkshop_Id(reviewer.getId(), workshopId).map(this::convertToDTO).orElse(null);
    }

    private RatingDTO convertToDTO(Rating rating) {
        User reviewer = rating.getReviewer();
        return RatingDTO.builder()
                .id(rating.getId())
                .ratedUserId(rating.getRatedUser().getId())
                .workshopId(rating.getWorkshop().getId())
                .reviewerName(reviewer.getName())
                .reviewerEmail(reviewer.getEmail())
                .rating(rating.getRating())
                .review(rating.getReview())
                .createdAt(rating.getCreatedAt().toString())
                .build();
    }
}