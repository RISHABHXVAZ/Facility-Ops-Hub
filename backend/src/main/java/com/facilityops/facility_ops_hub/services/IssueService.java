package com.facilityops.facility_ops_hub.services;

import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.IssueDTO;
import com.facilityops.facility_ops_hub.models.dto.IssueRequest;
import com.facilityops.facility_ops_hub.models.dto.UpdateIssueRequest;

import java.util.List;

public interface IssueService {

    IssueDTO createIssue(IssueRequest request, User user);

    List<IssueDTO> getMyIssues(User user);

    List<IssueDTO> getAssignedIssues(User engineer);

    List<IssueDTO> getAllIssues();

    IssueDTO getIssueById(Long id);

    IssueDTO updateMyIssue(Long issueId, UpdateIssueRequest request, User user);


}
