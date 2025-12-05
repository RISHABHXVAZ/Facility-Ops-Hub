package com.facilityops.facility_ops_hub.services.impl;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.IssueActivity;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.enums.ActivityType;
import com.facilityops.facility_ops_hub.repositories.IssueActivityRepository;
import com.facilityops.facility_ops_hub.services.IssueActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueActivityServiceImpl implements IssueActivityService {

    private final IssueActivityRepository activityRepo;

    @Override
    public void logActivity(Issue issue, User user, ActivityType type, String details) {
        IssueActivity activity = new IssueActivity();
        activity.setIssue(issue);
        activity.setPerformedBy(user);
        activity.setActivityType(type);
        activity.setDetails(details);

        activityRepo.save(activity);
    }

    @Override
    public List<IssueActivity> getIssueHistory(Long issueId) {
        return activityRepo.findByIssueIdOrderByTimestampAsc(issueId);
    }
}
