package com.skillswap.knowly_backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long id;
    private String name;
    private String code;
    private Long ownerId;
    private String ownerName;
    private boolean owner;
    private boolean active;
}
