package com.skillswap.skillswap_backend.service;

import com.skillswap.skillswap_backend.entity.Skill;
import com.skillswap.skillswap_backend.entity.SkillInterest;
import com.skillswap.skillswap_backend.entity.User;
import com.skillswap.skillswap_backend.repository.SkillInterestRepository;
import com.skillswap.skillswap_backend.repository.SkillRepository;
import com.skillswap.skillswap_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SkillInterestService {

    private final SkillInterestRepository skillInterestRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SkillInterestService(
            SkillInterestRepository skillInterestRepository,
            SkillRepository skillRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.skillInterestRepository = skillInterestRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public void expressInterest(Long skillId, String learnerEmail) {

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        User learner = userRepository.findByEmail(learnerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (skill.getOwner().getEmail().equals(learnerEmail)) {
            throw new RuntimeException(
                    "You cannot express interest in your own skill");
        }

        boolean alreadyInterested =
                skillInterestRepository
                        .findBySkill_IdAndLearner_Email(skillId, learnerEmail)
                        .isPresent();

        if (alreadyInterested) {
            throw new RuntimeException(
                    "You are already interested in this skill");
        }

        SkillInterest interest = SkillInterest.builder()
                .skill(skill)
                .learner(learner)
                .createdAt(LocalDateTime.now())
                .build();

        skillInterestRepository.save(interest);

        notificationService.createNotification(
                skill.getOwner().getEmail(),
                learner.getName()
                        + " is interested in learning your skill: "
                        + skill.getTitle()
        );
    }

    public void removeInterest(Long skillId, String learnerEmail) {

        SkillInterest interest = skillInterestRepository
                .findBySkill_IdAndLearner_Email(skillId, learnerEmail)
                .orElseThrow(() -> new RuntimeException(
                        "You have not expressed interest in this skill"));

        skillInterestRepository.delete(interest);
    }

    public long getInterestCount(Long skillId) {

        if (!skillRepository.existsById(skillId)) {
            throw new RuntimeException("Skill not found");
        }

        return skillInterestRepository.countBySkill_Id(skillId);
    }

    public List<SkillInterest> getInterestedLearners(
            Long skillId,
            String ownerEmail) {

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!skill.getOwner().getEmail().equals(ownerEmail)) {
            throw new RuntimeException(
                    "You are not authorized to view interested learners");
        }

        return skillInterestRepository.findBySkill_Id(skillId);
    }

    public boolean isInterested(Long skillId, String learnerEmail) {

        return skillInterestRepository
                .findBySkill_IdAndLearner_Email(skillId, learnerEmail)
                .isPresent();
    }
}