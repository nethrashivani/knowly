package com.skillswap.knowly_backend.repository;

import com.skillswap.knowly_backend.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    List<RoomMember> findByUser_Id(Long userId);
    Optional<RoomMember> findByRoom_IdAndUser_Id(Long roomId, Long userId);
    boolean existsByRoom_IdAndUser_Id(Long roomId, Long userId);
}
