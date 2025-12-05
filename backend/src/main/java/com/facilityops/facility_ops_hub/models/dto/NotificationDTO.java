package com.facilityops.facility_ops_hub.models.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String message;
    private boolean readStatus;
    private LocalDateTime timestamp;
}
