package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.RoomDTO;
import com.skillswap.knowly_backend.service.RoomService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<List<RoomDTO>> getMyRooms(Authentication authentication) {
        return ResponseEntity.ok(roomService.getMyRooms(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(Authentication authentication, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(roomService.createRoom(authentication.getName(), body.get("name")));
    }

    @PostMapping("/join")
    public ResponseEntity<RoomDTO> joinRoom(Authentication authentication, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(roomService.joinRoom(authentication.getName(), body.get("code")));
    }

    @PutMapping("/{roomId}/active")
    public ResponseEntity<RoomDTO> switchRoom(Authentication authentication, @PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.switchRoom(authentication.getName(), roomId));
    }

    @DeleteMapping("/{roomId}/memberships")
    public ResponseEntity<Void> leaveRoom(Authentication authentication, @PathVariable Long roomId) {
        roomService.leaveRoom(authentication.getName(), roomId);
        return ResponseEntity.noContent().build();
    }
}
