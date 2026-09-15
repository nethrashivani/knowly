package com.skillswap.knowly_backend.repository;

import com.skillswap.knowly_backend.entity.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    List<Workshop> findByTeacher_Email(String email);
    List<Workshop> findByTeacher_Id(Long teacherId);
    List<Workshop> findByRoom_Id(Long roomId);
    List<Workshop> findByRoomIsNull();
}
