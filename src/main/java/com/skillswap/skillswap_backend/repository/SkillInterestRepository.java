package com.skillswap.skillswap_backend.repository;

import com.skillswap.skillswap_backend.entity.SkillInterest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillInterestRepository
        extends JpaRepository<SkillInterest, Long> {

    Optional<SkillInterest> findBySkill_IdAndLearner_Email(
            Long skillId,
            String learnerEmail
    );

    long countBySkill_Id(Long skillId);

    List<SkillInterest> findBySkill_Id(Long skillId);

    List<SkillInterest> findByLearner_Email(String learnerEmail);
}