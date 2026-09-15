package com.skillswap.knowly_backend.service;

import com.skillswap.knowly_backend.entity.Notification;
import com.skillswap.knowly_backend.entity.User;
import com.skillswap.knowly_backend.repository.NotificationRepository;
import com.skillswap.knowly_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void createNotification(
            String userEmail,
            String message) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(
            String userEmail) {

        return notificationRepository
                .findByUser_EmailOrderByCreatedAtDesc(userEmail);
    }

    public long getUnreadCount(String userEmail) {

        return notificationRepository
                .countByUser_EmailAndReadFalse(userEmail);
    }

    public void markAsRead(
            Long notificationId,
            String userEmail) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException(
                    "You are not authorized to update this notification");
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }
}