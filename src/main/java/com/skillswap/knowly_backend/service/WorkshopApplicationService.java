package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.dto.WorkshopApplicationDTO;
import com.skillswap.knowly_backend.entity.ApplicationStatus;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.entity.Workshop;
import com.skillswap.knowly_backend.entity.WorkshopApplication;
import com.skillswap.knowly_backend.repository.UserRepository;
import com.skillswap.knowly_backend.repository.WorkshopApplicationRepository;
import com.skillswap.knowly_backend.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkshopApplicationService {

    private final WorkshopApplicationRepository applicationRepository;
    private final WorkshopRepository workshopRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public WorkshopApplicationService(WorkshopApplicationRepository applicationRepository, WorkshopRepository workshopRepository, UserRepository userRepository, NotificationService notificationService, EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    public WorkshopApplicationDTO applyForWorkshop(Long workshopId, String learnerEmail) {
        Workshop workshop = workshopRepository.findById(workshopId).orElseThrow(() -> new RuntimeException("Workshop not found"));
        User learner = userRepository.findByEmail(learnerEmail).orElseThrow(() -> new RuntimeException("User not found"));

        if (workshop.getRoom() != null && (learner.getRoom() == null || !workshop.getRoom().getId().equals(learner.getRoom().getId()))) {
            throw new RuntimeException("You must switch to this workshop's room before applying");
        }
        if (workshop.getTeacher().getEmail().equals(learnerEmail)) throw new RuntimeException("You cannot apply to your own workshop");
        if (applicationRepository.findByWorkshop_IdAndLearner_Email(workshopId, learnerEmail).isPresent()) throw new RuntimeException("You have already applied to this workshop");

        if (workshop.isRequiresAcceptance()) {
            long acceptedCount = applicationRepository.findByWorkshop_Id(workshopId).stream()
                    .filter(application -> application.getStatus() == ApplicationStatus.ACCEPTED)
                    .count();
            if (acceptedCount >= workshop.getCapacity()) throw new RuntimeException("Workshop is full");
        }

        ApplicationStatus initialStatus = workshop.isRequiresAcceptance()
                ? ApplicationStatus.PENDING
                : ApplicationStatus.ACCEPTED;

        WorkshopApplication saved = applicationRepository.save(WorkshopApplication.builder()
                .workshop(workshop)
                .learner(learner)
                .status(initialStatus)
                .appliedAt(LocalDateTime.now())
                .build());

        if (workshop.isRequiresAcceptance()) {
            notificationService.createNotification(workshop.getTeacher().getEmail(), learner.getName() + " applied to your workshop: " + workshop.getTitle());
            sendEmailSafely(
                    workshop.getTeacher().getEmail(),
                    "New workshop application on Knowly",
                    "Hi " + workshop.getTeacher().getName() + ",\n\n"
                            + learner.getName() + " (" + learner.getEmail() + ") has applied to your workshop \""
                            + workshop.getTitle() + "\".\n\n"
                            + "Please open Knowly to review the application.\n\nRegards,\nKnowly");
        } else {
            notificationService.createNotification(learner.getEmail(), "You are enrolled in the workshop \"" + workshop.getTitle() + "\". No approval is required.");
            sendEmailSafely(
                    learner.getEmail(),
                    "You are enrolled in a Knowly workshop",
                    "Hi " + learner.getName() + ",\n\n"
                            + "You are enrolled in the workshop \"" + workshop.getTitle() + "\". No approval is required.\n\n"
                            + "Workshop details:\nDate & Time: " + workshop.getDateTime() + "\nLocation: " + workshop.getLocation() + "\n\nRegards,\nKnowly");
        }

        return convertToDTO(saved);
    }

    public List<WorkshopApplicationDTO> getMyApplications(String learnerEmail) {
        return applicationRepository.findByLearner_Email(learnerEmail).stream().map(this::convertToDTO).toList();
    }

    public List<WorkshopApplicationDTO> getWorkshopApplications(Long workshopId, String teacherEmail) {
        Workshop workshop = workshopRepository.findById(workshopId).orElseThrow(() -> new RuntimeException("Workshop not found"));
        if (!workshop.getTeacher().getEmail().equals(teacherEmail)) throw new RuntimeException("You are not authorized to view these applications");
        return applicationRepository.findByWorkshop_Id(workshopId).stream().map(this::convertToDTO).toList();
    }

    public WorkshopApplicationDTO updateApplicationStatus(Long applicationId, ApplicationStatus status, String teacherEmail) {
        WorkshopApplication application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));
        Workshop workshop = application.getWorkshop();
        User learner = application.getLearner();
        if (!workshop.getTeacher().getEmail().equals(teacherEmail)) throw new RuntimeException("You are not authorized to update this application");
        if (!workshop.isRequiresAcceptance()) return convertToDTO(application);
        if (application.getStatus() != ApplicationStatus.PENDING) return convertToDTO(application);

        if (status == ApplicationStatus.ACCEPTED) {
            long acceptedCount = applicationRepository.findByWorkshop_Id(workshop.getId()).stream()
                    .filter(item -> item.getStatus() == ApplicationStatus.ACCEPTED)
                    .count();
            if (acceptedCount >= workshop.getCapacity()) throw new RuntimeException("Workshop is full");
        }

        application.setStatus(status);
        WorkshopApplication saved = applicationRepository.save(application);

        if (status == ApplicationStatus.ACCEPTED) {
            notificationService.createNotification(learner.getEmail(), "Your application for the workshop \"" + workshop.getTitle() + "\" has been accepted.");
            sendEmailSafely(
                    learner.getEmail(),
                    "Your Knowly workshop application was accepted",
                    "Hi " + learner.getName() + ",\n\n"
                            + "Good news! Your application for the workshop \"" + workshop.getTitle() + "\" has been accepted.\n\n"
                            + "Workshop details:\nWorkshop: " + workshop.getTitle() + "\nDate & Time: " + workshop.getDateTime()
                            + "\nLocation: " + workshop.getLocation() + "\n\nRegards,\nKnowly");
        } else if (status == ApplicationStatus.REJECTED) {
            notificationService.createNotification(learner.getEmail(), "Your application for the workshop \"" + workshop.getTitle() + "\" has been rejected.");
            sendEmailSafely(
                    learner.getEmail(),
                    "Update on your Knowly workshop application",
                    "Hi " + learner.getName() + ",\n\n"
                            + "Your application for the workshop \"" + workshop.getTitle() + "\" was not accepted this time.\n\n"
                            + "You can explore other workshops on Knowly.\n\nRegards,\nKnowly");
        }
        return convertToDTO(saved);
    }

    private void sendEmailSafely(String to, String subject, String body) {
        try {
            emailService.sendEmail(to, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send Knowly email to " + to + ": " + e.getMessage());
        }
    }

    private WorkshopApplicationDTO convertToDTO(WorkshopApplication application) {
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
                .meetingUrl(workshop.getMeetingUrl())
                .learnerId(learner.getId())
                .learnerName(learner.getName())
                .learnerEmail(learner.getEmail())
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .build();
    }
}
