package com.facilityops.facility_ops_hub.models.dto;

import com.facilityops.facility_ops_hub.models.enums.IssueStatus;
import lombok.Data;

@Data
public class UpdateIssueStatusRequest {
    private IssueStatus status;
}
