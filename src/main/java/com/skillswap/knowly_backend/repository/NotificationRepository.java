package com.skillswap.knowly_backend.repository;

import com.skillswap.knowly_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_EmailOrderByCreatedAtDesc(String email);

    long countByUser_EmailAndReadFalse(String email);
}