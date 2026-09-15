package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.WorkshopApplicationDTO;
import com.skillswap.knowly_backend.entity.ApplicationStatus;
import com.skillswap.knowly_backend.service.WorkshopApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workshop-applications")
public class WorkshopApplicationController {

    private final WorkshopApplicationService applicationService;

    public WorkshopApplicationController(
            WorkshopApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/workshop/{workshopId}")
    public ResponseEntity<WorkshopApplicationDTO> apply(
            Authentication authentication,
            @PathVariable Long workshopId) {

        return ResponseEntity.ok(
                applicationService.applyForWorkshop(
                        workshopId,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<WorkshopApplicationDTO>> getMyApplications(
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.getMyApplications(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<WorkshopApplicationDTO>> getWorkshopApplications(
            Authentication authentication,
            @PathVariable Long workshopId) {

        return ResponseEntity.ok(
                applicationService.getWorkshopApplications(
                        workshopId,
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<WorkshopApplicationDTO> updateStatus(
            Authentication authentication,
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status) {

        return ResponseEntity.ok(
                applicationService.updateApplicationStatus(
                        applicationId,
                        status,
                        authentication.getName()
                )
        );
    }
}