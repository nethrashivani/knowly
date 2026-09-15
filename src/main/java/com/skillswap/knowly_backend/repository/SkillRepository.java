package com.skillswap.knowly_backend.repository;

import com.skillswap.knowly_backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    // Filter by category
    List<Skill> findByCategory(String category);

    // Filter skills with custom categories
    @Query("SELECT s FROM Skill s WHERE s.category NOT IN " +
            "('Technology', 'Music', 'Art', 'Language', 'Sports', 'Cooking')")
    List<Skill> findOtherSkills();

    List<Skill> findByOwner_Email(String email);

    // Search by title or category containing keyword
    @Query("SELECT s FROM Skill s WHERE " +
            "LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Skill> searchSkills(@Param("keyword") String keyword);
}