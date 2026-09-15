package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.WorkshopDTO;
import com.skillswap.knowly_backend.service.WorkshopService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workshops")
@SecurityRequirement(name = "bearerAuth")
public class WorkshopController {

    private final WorkshopService workshopService;

    public WorkshopController(WorkshopService workshopService) {
        this.workshopService = workshopService;
    }

    @GetMapping
    public ResponseEntity<List<WorkshopDTO>> getAllWorkshops() {
        return ResponseEntity.ok(workshopService.getAllWorkshops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkshopDTO> getWorkshopById(
            @PathVariable Long id) {

        return workshopService.getAllWorkshops()
                .stream()
                .filter(workshop -> workshop.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<WorkshopDTO>> getMyWorkshops(
            Authentication authentication) {

        return ResponseEntity.ok(
                workshopService.getMyWorkshops(authentication.getName())
        );
    }

    @PostMapping
    public ResponseEntity<WorkshopDTO> createWorkshop(
            Authentication authentication,
            @Valid @RequestBody WorkshopDTO dto) {

        return ResponseEntity.ok(
                workshopService.createWorkshop(
                        authentication.getName(), dto
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkshop(
            Authentication authentication,
            @PathVariable Long id) {

        workshopService.deleteWorkshop(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}