package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.RoomDTO;
import com.skillswap.knowly_backend.entity.Room;
import com.skillswap.knowly_backend.entity.RoomMember;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.repository.RoomMemberRepository;
import com.skillswap.knowly_backend.repository.RoomRepository;
import com.skillswap.knowly_backend.repository.UserRepository;
import com.skillswap.knowly_backend.repository.WorkshopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class RoomService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final WorkshopRepository workshopRepository;
    private final NotificationService notificationService;

    public RoomService(RoomRepository roomRepository, RoomMemberRepository roomMemberRepository,
                       UserRepository userRepository, WorkshopRepository workshopRepository,
                       NotificationService notificationService) {
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.userRepository = userRepository;
        this.workshopRepository = workshopRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public RoomDTO createRoom(String email, String name) {
        User user = findUser(email);
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Room name is required");
        Room room = roomRepository.save(Room.builder().name(name.trim()).code(generateUniqueCode()).owner(user).build());
        addMembership(user, room);
        user.setRoom(room);
        userRepository.save(user);
        return toDTO(room, user, true);
    }

    @Transactional
    public RoomDTO joinRoom(String email, String code) {
        User user = findUser(email);
        if (code == null || code.isBlank()) throw new IllegalArgumentException("Room code is required");
        Room room = roomRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid room code"));
        addMembership(user, room);
        user.setRoom(room);
        userRepository.save(user);
        return toDTO(room, user, false);
    }

    @Transactional
    public List<RoomDTO> getMyRooms(String email) {
        User user = findUser(email);
        ensureLegacyMembership(user);
        return roomMemberRepository.findByUser_Id(user.getId()).stream()
                .map(member -> toDTO(member.getRoom(), user, true)).toList();
    }

    @Transactional
    public RoomDTO switchRoom(String email, Long roomId) {
        User user = findUser(email);
        RoomMember membership = roomMemberRepository.findByRoom_IdAndUser_Id(roomId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this room"));
        user.setRoom(membership.getRoom());
        userRepository.save(user);
        return toDTO(membership.getRoom(), user, true);
    }

    @Transactional
    public void leaveRoom(String email, Long roomId) {
        User user = findUser(email);
        RoomMember membership = roomMemberRepository.findByRoom_IdAndUser_Id(roomId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this room"));
        if (membership.getRoom().getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Room owners must delete their room instead of leaving it");
        }
        roomMemberRepository.delete(membership);
        if (user.getRoom() != null && user.getRoom().getId().equals(roomId)) {
            List<RoomMember> remaining = roomMemberRepository.findByUser_Id(user.getId());
            user.setRoom(remaining.isEmpty() ? null : remaining.get(0).getRoom());
            userRepository.save(user);
        }
    }

    @Transactional
    public void deleteRoom(String email, Long roomId) {
        User owner = findUser(email);
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("Room not found"));
        if (!room.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Only the room owner can delete this room");
        }

        List<RoomMember> members = roomMemberRepository.findByRoom_Id(roomId);
        for (RoomMember member : members) {
            User memberUser = member.getUser();
            if (memberUser.getRoom() != null && memberUser.getRoom().getId().equals(roomId)) {
                memberUser.setRoom(null);
                userRepository.save(memberUser);
            }
            if (!memberUser.getId().equals(owner.getId())) {
                notificationService.createNotification(memberUser.getEmail(),
                        "The room \"" + room.getName() + "\" was deleted by its owner. You are no longer a member of this room.");
            }
        }

        // Keep historical workshop records, but detach them from the deleted room.
        workshopRepository.findByRoom_Id(roomId).forEach(workshop -> {
            workshop.setRoom(null);
            workshopRepository.save(workshop);
        });

        roomMemberRepository.deleteAll(members);
        roomRepository.delete(room);
    }

    private void ensureLegacyMembership(User user) {
        if (user.getRoom() != null && !roomMemberRepository.existsByRoom_IdAndUser_Id(user.getRoom().getId(), user.getId())) {
            addMembership(user, user.getRoom());
        }
    }

    private void addMembership(User user, Room room) {
        if (!roomMemberRepository.existsByRoom_IdAndUser_Id(room.getId(), user.getId())) {
            roomMemberRepository.save(RoomMember.builder().room(room).user(user).build());
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder value = new StringBuilder("KN-");
            for (int i = 0; i < 6; i++) value.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
            code = value.toString();
        } while (roomRepository.existsByCode(code));
        return code;
    }

    private RoomDTO toDTO(Room room, User user, boolean includeCode) {
        return RoomDTO.builder()
                .id(room.getId()).name(room.getName())
                .code(includeCode && room.getOwner().getId().equals(user.getId()) ? room.getCode() : null)
                .ownerId(room.getOwner().getId()).ownerName(room.getOwner().getName())
                .owner(room.getOwner().getId().equals(user.getId()))
                .active(user.getRoom() != null && user.getRoom().getId().equals(room.getId())).build();
    }
}
