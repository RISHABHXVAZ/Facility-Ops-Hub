package com.facilityops.facility_ops_hub.services;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.IssueActivity;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.enums.ActivityType;

import java.util.List;

public interface IssueActivityService {
    void logActivity(Issue issue, User user, ActivityType type, String details);
    List<IssueActivity> getIssueHistory(Long issueId);
}
