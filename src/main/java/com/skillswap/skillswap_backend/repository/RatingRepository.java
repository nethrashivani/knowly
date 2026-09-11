package com.skillswap.skillswap_backend.repository;

import com.skillswap.skillswap_backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByRatedUser_Id(Long userId);

    Optional<Rating> findByReviewer_IdAndRatedUser_Id(
            Long reviewerId,
            Long ratedUserId
    );

    boolean existsByReviewer_IdAndRatedUser_Id(
            Long reviewerId,
            Long ratedUserId
    );
}