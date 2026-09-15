package com.skillswap.knowly_backend.repository;

import com.skillswap.knowly_backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByRatedUser_Id(Long userId);

    List<Rating> findByWorkshop_IdOrderByCreatedAtDesc(Long workshopId);

    Optional<Rating> findByReviewer_IdAndWorkshop_Id(Long reviewerId, Long workshopId);

    boolean existsByReviewer_IdAndWorkshop_Id(Long reviewerId, Long workshopId);
}