package com.skillswap.knowly_backend.repository;

import com.skillswap.knowly_backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByCodeIgnoreCase(String code);
    boolean existsByCode(String code);
}
