package com.skillswap.knowly_backend.service;

import com.skillswap.skillswap_backend.entity.ApplicationStatus;
import com.skillswap.skillswap_backend.entity.User;
import com.skillswap.skillswap_backend.entity.Workshop;
import com.skillswap.skillswap_backend.entity.WorkshopApplication;
import com.skillswap.skillswap_backend.entity.WorkshopResource;
import com.skillswap.skillswap_backend.repository.WorkshopApplicationRepository;
import com.skillswap.skillswap_backend.repository.WorkshopRepository;
import com.skillswap.skillswap_backend.repository.WorkshopResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class WorkshopResourceService {

    private final WorkshopResourceRepository resourceRepository;
    private final WorkshopRepository workshopRepository;
    private final WorkshopApplicationRepository applicationRepository;

    private final Path uploadRoot =
            Paths.get("uploads", "workshops");

    public WorkshopResourceService(
            WorkshopResourceRepository resourceRepository,
            WorkshopRepository workshopRepository,
            WorkshopApplicationRepository applicationRepository) {

        this.resourceRepository = resourceRepository;
        this.workshopRepository = workshopRepository;
        this.applicationRepository = applicationRepository;
    }

    /**
     * Upload a learning resource to a workshop.
     * Only the workshop teacher can upload resources.
     */
    public WorkshopResource uploadResource(
            Long workshopId,
            String teacherEmail,
            String title,
            MultipartFile file) {

        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() ->
                        new RuntimeException("Workshop not found"));

        if (!workshop.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException(
                    "You are not authorized to upload resources to this workshop");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a file");
        }

        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Resource title is required");
        }

        try {
            Path workshopDirectory =
                    uploadRoot.resolve(String.valueOf(workshopId));

            Files.createDirectories(workshopDirectory);

            String originalFileName = file.getOriginalFilename();

            if (originalFileName == null ||
                    originalFileName.trim().isEmpty()) {
                throw new RuntimeException("Invalid file name");
            }

            String safeFileName =
                    Paths.get(originalFileName)
                            .getFileName()
                            .toString();

            String storedFileName =
                    UUID.randomUUID() + "_" + safeFileName;

            Path targetPath =
                    workshopDirectory.resolve(storedFileName);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            WorkshopResource resource = WorkshopResource.builder()
                    .workshop(workshop)
                    .title(title.trim())
                    .fileName(safeFileName)
                    .fileType(
                            file.getContentType() != null
                                    ? file.getContentType()
                                    : "application/octet-stream"
                    )
                    .filePath(targetPath.toString())
                    .build();

            return resourceRepository.save(resource);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to upload resource", e);
        }
    }

    /**
     * Get all resources for a workshop.
     * Access is allowed only to:
     * 1. The workshop teacher
     * 2. A learner whose application is ACCEPTED
     */
    public List<WorkshopResource> getWorkshopResources(
            Long workshopId,
            String userEmail) {

        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() ->
                        new RuntimeException("Workshop not found"));

        boolean isTeacher =
                workshop.getTeacher().getEmail().equals(userEmail);

        if (isTeacher) {
            return resourceRepository.findByWorkshop_Id(workshopId);
        }

        WorkshopApplication application =
                applicationRepository
                        .findByWorkshop_IdAndLearner_Email(
                                workshopId,
                                userEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "You do not have access to these resources"));

        if (application.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new RuntimeException(
                    "Only accepted learners can access workshop resources");
        }

        return resourceRepository.findByWorkshop_Id(workshopId);
    }

    /**
     * Get a single resource.
     * Access is checked before returning the resource.
     */
    public WorkshopResource getResource(
            Long resourceId,
            String userEmail) {

        WorkshopResource resource =
                resourceRepository.findById(resourceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resource not found"));

        Workshop workshop = resource.getWorkshop();

        checkResourceAccess(workshop, userEmail);

        return resource;
    }

    /**
     * Delete a resource.
     * Only the workshop teacher can delete resources.
     */
    public void deleteResource(
            Long resourceId,
            String teacherEmail) {

        WorkshopResource resource =
                resourceRepository.findById(resourceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resource not found"));

        Workshop workshop = resource.getWorkshop();

        if (!workshop.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException(
                    "You are not authorized to delete this resource");
        }

        try {
            Path filePath =
                    Paths.get(resource.getFilePath());

            Files.deleteIfExists(filePath);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete resource file", e);
        }

        resourceRepository.delete(resource);
    }

    /**
     * Checks whether the user can access resources
     * belonging to the given workshop.
     */
    private void checkResourceAccess(
            Workshop workshop,
            String userEmail) {

        boolean isTeacher =
                workshop.getTeacher().getEmail().equals(userEmail);

        if (isTeacher) {
            return;
        }

        WorkshopApplication application =
                applicationRepository
                        .findByWorkshop_IdAndLearner_Email(
                                workshop.getId(),
                                userEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "You do not have access to this resource"));

        if (application.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new RuntimeException(
                    "Only accepted learners can access workshop resources");
        }
    }
}