package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.entity.WorkshopResource;
import com.skillswap.knowly_backend.service.WorkshopResourceService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/workshop-resources")
public class WorkshopResourceController {

    private final WorkshopResourceService resourceService;

    public WorkshopResourceController(
            WorkshopResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping(
            value = "/workshop/{workshopId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<WorkshopResource> uploadResource(
            @PathVariable Long workshopId,
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        WorkshopResource resource =
                resourceService.uploadResource(
                        workshopId,
                        authentication.getName(),
                        title,
                        file
                );

        return ResponseEntity.ok(resource);
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<WorkshopResource>> getWorkshopResources(
            @PathVariable Long workshopId,
            Authentication authentication) {

        return ResponseEntity.ok(
                resourceService.getWorkshopResources(
                        workshopId,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<WorkshopResource> getResource(
            @PathVariable Long resourceId,
            Authentication authentication) {

        return ResponseEntity.ok(
                resourceService.getResource(
                        resourceId,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{resourceId}/download")
    public ResponseEntity<Resource> downloadResource(
            @PathVariable Long resourceId,
            Authentication authentication) {

        WorkshopResource workshopResource =
                resourceService.getResource(
                        resourceId,
                        authentication.getName()
                );

        Path filePath =
                Paths.get(workshopResource.getFilePath());

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource =
                new FileSystemResource(filePath);

        String contentType;

        try {
            contentType = Files.probeContentType(filePath);
        } catch (Exception e) {
            contentType = null;
        }

        if (contentType == null) {
            contentType = workshopResource.getFileType();
        }

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                workshopResource.getFileName() +
                                "\""
                )
                .body(resource);
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long resourceId,
            Authentication authentication) {

        resourceService.deleteResource(
                resourceId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}