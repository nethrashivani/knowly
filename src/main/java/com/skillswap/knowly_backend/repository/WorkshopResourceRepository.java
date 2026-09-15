package com.skillswap.knowly_backend.repository;

import com.skillswap.skillswap_backend.entity.WorkshopResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkshopResourceRepository
        extends JpaRepository<WorkshopResource, Long> {

    List<WorkshopResource> findByWorkshop_Id(Long workshopId);
}