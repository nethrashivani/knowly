package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.WorkshopDTO;
import com.skillswap.knowly_backend.entity.Room;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.entity.Workshop;
import com.skillswap.knowly_backend.repository.RoomMemberRepository;
import com.skillswap.knowly_backend.repository.RoomRepository;
import com.skillswap.knowly_backend.repository.UserRepository;
import com.skillswap.knowly_backend.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;

    public WorkshopService(WorkshopRepository workshopRepository, UserRepository userRepository,
                           RoomRepository roomRepository, RoomMemberRepository roomMemberRepository) {
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
    }

    public WorkshopDTO createWorkshop(String email, WorkshopDTO dto) {
        User teacher = findUser(email);
        validateMeetingUrl(dto);

        Room room = null;
        if (dto.getRoomId() != null) {
            room = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("Room not found"));
            if (!roomMemberRepository.existsByRoom_IdAndUser_Id(room.getId(), teacher.getId())) {
                throw new IllegalArgumentException("You must be a member of the selected room to create a room workshop");
            }
        }

        if (dto.isRequiresAcceptance() && (dto.getCapacity() == null || dto.getCapacity() < 1)) {
            throw new IllegalArgumentException("Capacity is required for workshops with manual acceptance");
        }

        Workshop workshop = Workshop.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dateTime(dto.getDateTime())
                .location(dto.getLocation())
                .meetingUrl(dto.getMeetingUrl())
                .capacity(dto.isRequiresAcceptance() ? dto.getCapacity() : 0)
                .requiresAcceptance(dto.isRequiresAcceptance())
                .room(room)
                .teacher(teacher)
                .build();

        return convertToDTO(workshopRepository.save(workshop));
    }

    public List<WorkshopDTO> getAllWorkshops(String email) {
        return workshopRepository.findByRoomIsNull().stream().map(this::convertToDTO).toList();
    }

    public List<WorkshopDTO> getRoomWorkshops(Long roomId, String email) {
        User user = findUser(email);
        if (!roomMemberRepository.existsByRoom_IdAndUser_Id(roomId, user.getId())) {
            throw new IllegalArgumentException("You are not a member of this room");
        }
        return workshopRepository.findByRoom_Id(roomId).stream().map(this::convertToDTO).toList();
    }

    public WorkshopDTO getWorkshopById(Long id, String email) {
        User user = findUser(email);
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));
        if (workshop.getRoom() != null && !roomMemberRepository.existsByRoom_IdAndUser_Id(workshop.getRoom().getId(), user.getId())) {
            throw new RuntimeException("You are not a member of this workshop's room");
        }
        return convertToDTO(workshop);
    }

    public List<WorkshopDTO> getMyWorkshops(String email) {
        return workshopRepository.findByTeacher_Email(email).stream().map(this::convertToDTO).toList();
    }

    public List<WorkshopDTO> getWorkshopsByTeacher(Long teacherId) {
        if (!userRepository.existsById(teacherId)) throw new RuntimeException("User not found");
        return workshopRepository.findByTeacher_Id(teacherId).stream().map(this::convertToDTO).toList();
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
        boolean online = dto.getLocation() != null && "online".equalsIgnoreCase(dto.getLocation().trim());
        String url = dto.getMeetingUrl();
        if (online && (url == null || url.isBlank())) throw new IllegalArgumentException("Meeting URL is required for online workshops");
        if (url != null && !url.isBlank() && !(url.startsWith("https://") || url.startsWith("http://"))) {
            throw new IllegalArgumentException("Meeting URL must start with http:// or https://");
        }
    }

    private WorkshopDTO convertToDTO(Workshop workshop) {
        return WorkshopDTO.builder()
                .id(workshop.getId()).title(workshop.getTitle()).description(workshop.getDescription())
                .dateTime(workshop.getDateTime()).location(workshop.getLocation()).meetingUrl(workshop.getMeetingUrl())
                .capacity(workshop.isRequiresAcceptance() ? workshop.getCapacity() : null)
                .requiresAcceptance(workshop.isRequiresAcceptance()).teacherId(workshop.getTeacher().getId())
                .teacherName(workshop.getTeacher().getName()).teacherEmail(workshop.getTeacher().getEmail())
                .roomId(workshop.getRoom() == null ? null : workshop.getRoom().getId())
                .roomName(workshop.getRoom() == null ? null : workshop.getRoom().getName()).build();
    }
}
