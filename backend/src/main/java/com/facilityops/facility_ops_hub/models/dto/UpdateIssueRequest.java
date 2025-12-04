package com.facilityops.facility_ops_hub.models.dto;

import com.facilityops.facility_ops_hub.models.enums.Priority;
import lombok.Data;

@Data
public class UpdateIssueRequest {

    private String title;
    private String description;
    private Priority priority;   // LOW / MEDIUM / HIGH
}
