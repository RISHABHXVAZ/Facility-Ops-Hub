package com.facilityops.facility_ops_hub.controllers;

import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.*;
import com.facilityops.facility_ops_hub.models.enums.Role;
import com.facilityops.facility_ops_hub.services.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping("/create")
    public IssueDTO create(@RequestBody IssueRequest request,
                           @AuthenticationPrincipal User user) {
        return issueService.createIssue(request, user);
    }

    @GetMapping("/my")
    public List<IssueDTO> myIssues(@AuthenticationPrincipal User user) {
        return issueService.getMyIssues(user);
    }


    @GetMapping("/assigned")
    public List<IssueDTO> assignedIssues(@AuthenticationPrincipal User user) {

        if (user.getRole() != Role.ENGINEER && user.getRole() != Role.ADMIN)
            throw new RuntimeException("Only engineers and admin can view assigned issues");

        return issueService.getAssignedIssues(user);
    }

    @GetMapping("/all")
    public List<IssueDTO> allIssues(@AuthenticationPrincipal User user) {

        if (user.getRole() != Role.ADMIN)
            throw new RuntimeException("Only admin can view all issues");

        return issueService.getAllIssues();
    }

    @GetMapping("/{id}")
    public IssueDTO getOne(@PathVariable Long id) {
        return issueService.getIssueById(id);
    }

    @PutMapping("/update/{id}")
    public IssueDTO updateMyIssue(@PathVariable Long id,
                                  @RequestBody UpdateIssueRequest request,
                                  @AuthenticationPrincipal User user) {
        return issueService.updateMyIssue(id, request, user);
    }

    @PutMapping("/{issueId}/assign")
    public IssueDTO assignIssue(@PathVariable Long issueId,
                                @RequestBody AssignIssueRequest request,
                                @AuthenticationPrincipal User admin) {
        return issueService.assignIssue(issueId, request.getEngineerId(), admin);
    }

    @PutMapping("/{id}/status")
    public IssueDTO updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateIssueStatusRequest request,
            @AuthenticationPrincipal User user) {

        return issueService.updateStatus(id, request, user);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteIssue(@PathVariable Long id,
                              @AuthenticationPrincipal User user) {
        issueService.deleteIssue(id, user);
        return "Issue deleted successfully";
    }

    @GetMapping("/history")
    public List<IssueDTO> getHistory(@AuthenticationPrincipal User user) {
        return issueService.getHistory(user);
    }


}
