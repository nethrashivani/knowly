package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.WorkshopDTO;
import com.skillswap.knowly_backend.entity.Room;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.entity.Workshop;
import com.skillswap.knowly_backend.repository.UserRepository;
import com.skillswap.knowly_backend.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final UserRepository userRepository;

    public WorkshopService(WorkshopRepository workshopRepository, UserRepository userRepository) {
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
    }

    public WorkshopDTO createWorkshop(String email, WorkshopDTO dto) {
        User teacher = findUser(email);
        validateMeetingUrl(dto);
        Room activeRoom = teacher.getRoom();

        if (activeRoom == null) {
            throw new IllegalArgumentException("Join or create a room before creating a workshop");
        }

        Workshop workshop = Workshop.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dateTime(dto.getDateTime())
                .location(dto.getLocation())
                .meetingUrl(dto.getMeetingUrl())
                .capacity(dto.getCapacity())
                .requiresAcceptance(dto.isRequiresAcceptance())
                .room(activeRoom)
                .teacher(teacher)
                .build();

        return convertToDTO(workshopRepository.save(workshop));
    }

    public List<WorkshopDTO> getAllWorkshops(String email) {
        User user = findUser(email);
        List<Workshop> workshops = user.getRoom() == null
                ? List.of()
                : workshopRepository.findByRoom_Id(user.getRoom().getId());
        return workshops.stream().map(this::convertToDTO).toList();
    }

    public WorkshopDTO getWorkshopById(Long id, String email) {
        User user = findUser(email);
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));

        if (workshop.getRoom() != null && (user.getRoom() == null || !workshop.getRoom().getId().equals(user.getRoom().getId()))) {
            throw new RuntimeException("You are not a member of this workshop's room");
        }
        return convertToDTO(workshop);
    }

    public List<WorkshopDTO> getMyWorkshops(String email) {
        return workshopRepository.findByTeacher_Email(email).stream().map(this::convertToDTO).toList();
    }

    public void deleteWorkshop(Long id, String email) {
        Workshop workshop = workshopRepository.findById(id).orElseThrow(() -> new RuntimeException("Workshop not found"));
        if (!workshop.getTeacher().getEmail().equals(email)) throw new RuntimeException("You are not authorized to delete this workshop");
        workshopRepository.delete(workshop);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void validateMeetingUrl(WorkshopDTO dto) {
        boolean online = "online".equalsIgnoreCase(dto.getLocation().trim());
        String url = dto.getMeetingUrl();
        if (online && (url == null || url.isBlank())) throw new IllegalArgumentException("Meeting URL is required for online workshops");
        if (url != null && !url.isBlank() && !(url.startsWith("https://") || url.startsWith("http://"))) {
            throw new IllegalArgumentException("Meeting URL must start with http:// or https://");
        }
    }

    private WorkshopDTO convertToDTO(Workshop workshop) {
        return WorkshopDTO.builder()
                .id(workshop.getId())
                .title(workshop.getTitle())
                .description(workshop.getDescription())
                .dateTime(workshop.getDateTime())
                .location(workshop.getLocation())
                .meetingUrl(workshop.getMeetingUrl())
                .capacity(workshop.getCapacity())
                .requiresAcceptance(workshop.isRequiresAcceptance())
                .teacherId(workshop.getTeacher().getId())
                .teacherName(workshop.getTeacher().getName())
                .teacherEmail(workshop.getTeacher().getEmail())
                .roomId(workshop.getRoom() == null ? null : workshop.getRoom().getId())
                .roomName(workshop.getRoom() == null ? null : workshop.getRoom().getName())
                .build();
    }
}
