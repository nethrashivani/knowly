package com.skillswap.knowly_backend.repository;

import com.skillswap.skillswap_backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByRatedUser_Id(Long userId);

    boolean existsByReviewer_IdAndWorkshop_Id(
            Long reviewerId,
            Long workshopId
    );
}