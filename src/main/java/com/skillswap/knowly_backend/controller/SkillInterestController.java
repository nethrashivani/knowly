package com.skillswap.knowly_backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.skillswap.knowly_backend.entity.SkillInterest;
import com.skillswap.knowly_backend.service.SkillInterestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skill-interests")
@SecurityRequirement(name = "bearerAuth")
public class SkillInterestController {

    private final SkillInterestService skillInterestService;

    public SkillInterestController(
            SkillInterestService skillInterestService) {
        this.skillInterestService = skillInterestService;
    }

    @PostMapping("/skill/{skillId}")
    public ResponseEntity<Void> expressInterest(
            @PathVariable Long skillId,
            Authentication authentication) {

        skillInterestService.expressInterest(
                skillId,
                authentication.getName());

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/skill/{skillId}")
    public ResponseEntity<Void> removeInterest(
            @PathVariable Long skillId,
            Authentication authentication) {

        skillInterestService.removeInterest(
                skillId,
                authentication.getName());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/skill/{skillId}/count")
    public ResponseEntity<Long> getInterestCount(
            @PathVariable Long skillId) {

        return ResponseEntity.ok(
                skillInterestService.getInterestCount(skillId));
    }

    @GetMapping("/skill/{skillId}/learners")
    public ResponseEntity<List<Map<String, Object>>> getInterestedLearners(
            @PathVariable Long skillId,
            Authentication authentication) {

        List<SkillInterest> interests =
                skillInterestService.getInterestedLearners(
                        skillId,
                        authentication.getName());

        List<Map<String, Object>> learners = new ArrayList<>();

        for (SkillInterest interest : interests) {
            Map<String, Object> learner = new HashMap<>();

            learner.put("learnerName", interest.getLearner().getName());
            learner.put("learnerEmail", interest.getLearner().getEmail());
            learner.put("createdAt", interest.getCreatedAt());

            learners.add(learner);
        }

        return ResponseEntity.ok(learners);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyInterests(
            Authentication authentication) {

        List<SkillInterest> interests =
                skillInterestService.getMyInterests(
                        authentication.getName());

        List<Map<String, Object>> skills = new ArrayList<>();

        for (SkillInterest interest : interests) {
            Map<String, Object> skill = new HashMap<>();

            skill.put("interestId", interest.getId());
            skill.put("skillId", interest.getSkill().getId());
            skill.put("skillTitle", interest.getSkill().getTitle());
            skill.put("ownerName", interest.getSkill().getOwner().getName());
            skill.put("ownerEmail", interest.getSkill().getOwner().getEmail());
            skill.put("createdAt", interest.getCreatedAt());

            skills.add(skill);
        }

        return ResponseEntity.ok(skills);
    }

    @GetMapping("/skill/{skillId}/status")
    public ResponseEntity<Boolean> isInterested(
            @PathVariable Long skillId,
            Authentication authentication) {

        return ResponseEntity.ok(
                skillInterestService.isInterested(
                        skillId,
                        authentication.getName()));
    }
}