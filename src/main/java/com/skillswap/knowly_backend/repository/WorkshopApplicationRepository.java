package com.skillswap.knowly_backend.repository;

import com.skillswap.skillswap_backend.entity.WorkshopApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkshopApplicationRepository
        extends JpaRepository<WorkshopApplication, Long> {

    List<WorkshopApplication> findByLearner_Email(String email);

    List<WorkshopApplication> findByWorkshop_Id(Long workshopId);

    Optional<WorkshopApplication> findByWorkshop_IdAndLearner_Email(
            Long workshopId,
            String email
    );

    Optional<WorkshopApplication> findByWorkshop_IdAndLearner_Id(
            Long workshopId,
            Long learnerId
    );
}