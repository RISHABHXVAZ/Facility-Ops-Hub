package com.facilityops.facility_ops_hub.models.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDTO {

    private Long id;
    private String message;
    private LocalDateTime createdAt;

    private Long createdById;
    private String createdByName;

    private Long issueId;
}
