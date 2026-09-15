package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.RoomDTO;
import com.skillswap.knowly_backend.entity.Room;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.repository.RoomRepository;
import com.skillswap.knowly_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
public class RoomService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public RoomService(RoomRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RoomDTO createRoom(String email, String name) {
        User owner = findUser(email);
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Room name is required");
        }

        Room room = Room.builder()
                .name(name.trim())
                .code(generateUniqueCode())
                .owner(owner)
                .build();

        room = roomRepository.save(room);
        owner.setRoom(room);
        userRepository.save(owner);
        return toDTO(room, owner);
    }

    @Transactional
    public RoomDTO joinRoom(String email, String code) {
        User user = findUser(email);
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Room code is required");
        }

        Room room = roomRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid room code"));

        user.setRoom(room);
        userRepository.save(user);
        return toDTO(room, user);
    }

    public RoomDTO getMyRoom(String email) {
        User user = findUser(email);
        if (user.getRoom() == null) {
            return null;
        }
        return toDTO(user.getRoom(), user);
    }

    @Transactional
    public void leaveRoom(String email) {
        User user = findUser(email);
        user.setRoom(null);
        userRepository.save(user);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder value = new StringBuilder("KN-");
            for (int i = 0; i < 6; i++) {
                value.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
            }
            code = value.toString();
        } while (roomRepository.existsByCode(code));
        return code;
    }

    private RoomDTO toDTO(Room room, User user) {
        return RoomDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .code(room.getCode())
                .ownerId(room.getOwner().getId())
                .ownerName(room.getOwner().getName())
                .owner(room.getOwner().getId().equals(user.getId()))
                .build();
    }
}
