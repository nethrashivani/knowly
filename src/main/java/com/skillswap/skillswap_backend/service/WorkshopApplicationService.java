package com.skillswap.skillswap_backend.service;

import com.skillswap.skillswap_backend.dto.WorkshopApplicationDTO;
import com.skillswap.skillswap_backend.entity.ApplicationStatus;
import com.skillswap.skillswap_backend.entity.User;
import com.skillswap.skillswap_backend.entity.Workshop;
import com.skillswap.skillswap_backend.entity.WorkshopApplication;
import com.skillswap.skillswap_backend.repository.UserRepository;
import com.skillswap.skillswap_backend.repository.WorkshopApplicationRepository;
import com.skillswap.skillswap_backend.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkshopApplicationService {

    private final WorkshopApplicationRepository applicationRepository;
    private final WorkshopRepository workshopRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WorkshopApplicationService(
            WorkshopApplicationRepository applicationRepository,
            WorkshopRepository workshopRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.applicationRepository = applicationRepository;
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public WorkshopApplicationDTO applyForWorkshop(
            Long workshopId,
            String learnerEmail) {

        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));

        User learner = userRepository.findByEmail(learnerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (workshop.getTeacher().getEmail().equals(learnerEmail)) {
            throw new RuntimeException(
                    "You cannot apply to your own workshop");
        }

        if (applicationRepository
                .findByWorkshop_IdAndLearner_Email(workshopId, learnerEmail)
                .isPresent()) {

            throw new RuntimeException(
                    "You have already applied to this workshop");
        }

        long acceptedCount = applicationRepository
                .findByWorkshop_Id(workshopId)
                .stream()
                .filter(application ->
                        application.getStatus() == ApplicationStatus.ACCEPTED)
                .count();

        if (acceptedCount >= workshop.getCapacity()) {
            throw new RuntimeException("Workshop is full");
        }

        WorkshopApplication application = WorkshopApplication.builder()
                .workshop(workshop)
                .learner(learner)
                .status(ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        WorkshopApplication saved =
                applicationRepository.save(application);

        // Notify the teacher that a learner applied
        notificationService.createNotification(
                workshop.getTeacher().getEmail(),
                learner.getName() + " applied to your workshop: "
                        + workshop.getTitle()
        );

        return convertToDTO(saved);
    }

    public List<WorkshopApplicationDTO> getMyApplications(
            String learnerEmail) {

        return applicationRepository
                .findByLearner_Email(learnerEmail)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<WorkshopApplicationDTO> getWorkshopApplications(
            Long workshopId,
            String teacherEmail) {

        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Workshop not found"));

        if (!workshop.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException(
                    "You are not authorized to view these applications");
        }

        return applicationRepository
                .findByWorkshop_Id(workshopId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public WorkshopApplicationDTO updateApplicationStatus(
            Long applicationId,
            ApplicationStatus status,
            String teacherEmail) {

        WorkshopApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        Workshop workshop = application.getWorkshop();
        User learner = application.getLearner();

        if (!workshop.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException(
                    "You are not authorized to update this application");
        }

        application.setStatus(status);

        WorkshopApplication saved =
                applicationRepository.save(application);

        // Notify the learner about the teacher's decision
        String message;

        if (status == ApplicationStatus.ACCEPTED) {
            message = "Your application for the workshop \""
                    + workshop.getTitle()
                    + "\" has been accepted.";
        } else if (status == ApplicationStatus.REJECTED) {
            message = "Your application for the workshop \""
                    + workshop.getTitle()
                    + "\" has been rejected.";
        } else {
            message = "Your application for the workshop \""
                    + workshop.getTitle()
                    + "\" is now pending.";
        }

        notificationService.createNotification(
                learner.getEmail(),
                message
        );

        return convertToDTO(saved);
    }

    private WorkshopApplicationDTO convertToDTO(
        WorkshopApplication application) {

    Workshop workshop = application.getWorkshop();
    User learner = application.getLearner();

    return WorkshopApplicationDTO.builder()
            .id(application.getId())
            .workshopId(workshop.getId())
            .workshopTitle(workshop.getTitle())
            .teacherName(workshop.getTeacher().getName())
            .teacherEmail(workshop.getTeacher().getEmail())
            .workshopDateTime(workshop.getDateTime())
            .location(workshop.getLocation())
            .learnerId(learner.getId())
            .learnerName(learner.getName())
            .learnerEmail(learner.getEmail())
            .status(application.getStatus())
            .appliedAt(application.getAppliedAt())
            .build();
}
}