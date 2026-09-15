package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.WorkshopDTO;
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

    public WorkshopService(
            WorkshopRepository workshopRepository,
            UserRepository userRepository) {
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
    }

    public WorkshopDTO createWorkshop(String email, WorkshopDTO dto) {

        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workshop workshop = Workshop.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dateTime(dto.getDateTime())
                .location(dto.getLocation())
                .capacity(dto.getCapacity())
                .teacher(teacher)
                .build();

        return convertToDTO(workshopRepository.save(workshop));
    }

    public List<WorkshopDTO> getAllWorkshops() {
        return workshopRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<WorkshopDTO> getMyWorkshops(String email) {
        return workshopRepository.findByTeacher_Email(email)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public void deleteWorkshop(Long id, String email) {

        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));

        if (!workshop.getTeacher().getEmail().equals(email)) {
            throw new RuntimeException("You are not authorized to delete this workshop");
        }

        workshopRepository.delete(workshop);
    }

    private WorkshopDTO convertToDTO(Workshop workshop) {
    return WorkshopDTO.builder()
            .id(workshop.getId())
            .title(workshop.getTitle())
            .description(workshop.getDescription())
            .dateTime(workshop.getDateTime())
            .location(workshop.getLocation())
            .capacity(workshop.getCapacity())
            .teacherId(workshop.getTeacher().getId())
            .teacherName(workshop.getTeacher().getName())
            .teacherEmail(workshop.getTeacher().getEmail())
            .build();
}
}