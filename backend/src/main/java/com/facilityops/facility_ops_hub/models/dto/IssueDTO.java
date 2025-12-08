package com.facilityops.facility_ops_hub.models.dto;

import com.facilityops.facility_ops_hub.models.enums.IssueStatus;
import com.facilityops.facility_ops_hub.models.enums.Priority;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IssueDTO {

    private Long id;

    private String title;
    private String description;

    private Priority priority;
    private IssueStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long createdById;
    private Long assignedToId;

    private LocalDateTime slaDeadline;
    private Boolean slaBreached;
    private LocalDateTime slaBreachedAt;
}
