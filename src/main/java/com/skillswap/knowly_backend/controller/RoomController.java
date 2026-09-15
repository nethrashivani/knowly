package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.RoomDTO;
import com.skillswap.knowly_backend.service.RoomService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@SecurityRequirement(name = "bearerAuth")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/my")
    public ResponseEntity<RoomDTO> getMyRoom(Authentication authentication) {
        RoomDTO room = roomService.getMyRoom(authentication.getName());
        return room == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(room);
    }

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(roomService.createRoom(authentication.getName(), body.get("name")));
    }

    @PostMapping("/join")
    public ResponseEntity<RoomDTO> joinRoom(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(roomService.joinRoom(authentication.getName(), body.get("code")));
    }

    @DeleteMapping("/my")
    public ResponseEntity<Void> leaveRoom(Authentication authentication) {
        roomService.leaveRoom(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
