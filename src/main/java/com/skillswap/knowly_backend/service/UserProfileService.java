package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.UserProfileDTO;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.entity.UserProfile;
import com.skillswap.knowly_backend.repository.UserProfileRepository;
import com.skillswap.knowly_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfileService(
            UserProfileRepository userProfileRepository,
            UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    public UserProfileDTO getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = userProfileRepository.findByUser_Email(email)
                .orElseGet(() -> createEmptyProfile(user));

        return convertToDTO(profile);
    }

    public UserProfileDTO getUserProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = userProfileRepository
                .findByUser_Email(user.getEmail())
                .orElseGet(() -> createEmptyProfile(user));

        return convertToDTO(profile);
    }

    public UserProfileDTO updateMyProfile(
            String email,
            UserProfileDTO dto) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = userProfileRepository
                .findByUser_Email(email)
                .orElseGet(() -> createEmptyProfile(user));

        profile.setBio(dto.getBio());
        profile.setSkillsWanted(dto.getSkillsWanted());

        UserProfile savedProfile =
                userProfileRepository.save(profile);

        return convertToDTO(savedProfile);
    }

    private UserProfile createEmptyProfile(User user) {

        UserProfile profile = UserProfile.builder()
                .user(user)
                .bio("")
                .skillsWanted("")
                .build();

        return userProfileRepository.save(profile);
    }

    private UserProfileDTO convertToDTO(UserProfile profile) {

        User user = profile.getUser();

        return UserProfileDTO.builder()
                .id(profile.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .bio(profile.getBio())
                .skillsWanted(profile.getSkillsWanted())
                .build();
    }
}