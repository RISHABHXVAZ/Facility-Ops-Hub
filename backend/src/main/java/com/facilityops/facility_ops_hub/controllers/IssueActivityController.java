package com.facilityops.facility_ops_hub.controllers;

import com.facilityops.facility_ops_hub.models.IssueActivity;
import com.facilityops.facility_ops_hub.services.IssueActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@CrossOrigin("*")
public class IssueActivityController {

    private final IssueActivityService activityService;

    // GET → all activity for a specific issue
    @GetMapping("/{issueId}/activity")
    public List<IssueActivity> getIssueActivity(@PathVariable Long issueId) {
        return activityService.getIssueHistory(issueId);
    }
}
