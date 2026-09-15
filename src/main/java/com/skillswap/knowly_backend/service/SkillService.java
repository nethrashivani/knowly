package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.exception.ResourceNotFoundException;
import com.skillswap.knowly_backend.exception.UnauthorizedException;
import com.skillswap.knowly_backend.dto.SkillDTO;
import com.skillswap.knowly_backend.entity.Skill;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.repository.SkillRepository;
import com.skillswap.knowly_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    // Get all skills
    public List<SkillDTO> getAllSkills() {
        return skillRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get skill by ID
    public SkillDTO getSkillById(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));
        return convertToDTO(skill);
    }

    // Create skill
    public SkillDTO createSkill(SkillDTO skillDTO, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Skill skill = convertToEntity(skillDTO);
        skill.setOwner(owner);

        Skill savedSkill = skillRepository.save(skill);
        return convertToDTO(savedSkill);
    }

    // Update skill
    public SkillDTO updateSkill(Long id, SkillDTO skillDTO, String ownerEmail) {

        Skill existing = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found with id: " + id));

        if (existing.getOwner() == null
                || !existing.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You are not authorized to edit this skill");
        }

        existing.setTitle(skillDTO.getTitle());
        existing.setCategory(skillDTO.getCategory());
        existing.setDescription(skillDTO.getDescription());
        existing.setExperienceYears(skillDTO.getExperienceYears());
        existing.setLocation(skillDTO.getLocation());

        Skill updatedSkill = skillRepository.save(existing);
        return convertToDTO(updatedSkill);
    }

    // Delete skill
    public void deleteSkill(Long id, String ownerEmail) {

        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        if (skill.getOwner() == null
                || !skill.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You are not authorized to delete this skill");
        }

        skillRepository.delete(skill);
    }

    // Search skills
    public List<SkillDTO> searchSkills(String keyword) {
        return skillRepository.searchSkills(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Filter by category
    public List<SkillDTO> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Filter by custom categories
    public List<SkillDTO> getOtherSkills() {
        return skillRepository.findOtherSkills()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    // Mapper methods

    private SkillDTO convertToDTO(Skill skill) {
        return SkillDTO.builder()
                .id(skill.getId())
                .title(skill.getTitle())
                .category(skill.getCategory())
                .description(skill.getDescription())
                .instructorName(skill.getOwner() != null
                        ? skill.getOwner().getName()
                        : null)
                .experienceYears(skill.getExperienceYears())
                .location(skill.getLocation())
                .createdAt(skill.getCreatedAt())
                .ownerEmail(skill.getOwner() != null
                        ? skill.getOwner().getEmail()
                        : null)
                .build();
    }

    private Skill convertToEntity(SkillDTO dto) {
        return Skill.builder()
                .title(dto.getTitle())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .experienceYears(dto.getExperienceYears())
                .location(dto.getLocation())
                .build();
    }

    public List<SkillDTO> getMySkills(String ownerEmail) {
        return skillRepository.findByOwner_Email(ownerEmail)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}