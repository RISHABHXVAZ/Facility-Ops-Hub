package com.facilityops.facility_ops_hub.services.impl;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.IssueDTO;
import com.facilityops.facility_ops_hub.models.dto.IssueRequest;
import com.facilityops.facility_ops_hub.models.dto.UpdateIssueRequest;
import com.facilityops.facility_ops_hub.models.enums.IssueStatus;
import com.facilityops.facility_ops_hub.repositories.IssueRepository;
import com.facilityops.facility_ops_hub.services.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;

    @Override
    public IssueDTO createIssue(IssueRequest request, User user) {

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setPriority(request.getPriority());
        issue.setStatus(IssueStatus.OPEN);
        issue.setCreatedBy(user);

        issueRepository.save(issue);

        return convertToDTO(issue);
    }

    @Override
    public List<IssueDTO> getMyIssues(User user) {
        return issueRepository.findByCreatedBy(user)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<IssueDTO> getAssignedIssues(User engineer) {
        return issueRepository.findByAssignedTo(engineer)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<IssueDTO> getAllIssues() {
        return issueRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public IssueDTO getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        return convertToDTO(issue);
    }



    private IssueDTO convertToDTO(Issue issue) {
        IssueDTO dto = new IssueDTO();

        dto.setId(issue.getId());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setPriority(issue.getPriority());
        dto.setStatus(issue.getStatus());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());

        if (issue.getCreatedBy() != null)
            dto.setCreatedById(issue.getCreatedBy().getId());

        if (issue.getAssignedTo() != null)
            dto.setAssignedToId(issue.getAssignedTo().getId());

        return dto;
    }
    @Override
    public IssueDTO updateMyIssue(Long issueId, UpdateIssueRequest request, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // Only issue creator can update their issue
        if (!issue.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this issue");
        }

        if (request.getTitle() != null)
            issue.setTitle(request.getTitle());

        if (request.getDescription() != null)
            issue.setDescription(request.getDescription());

        if (request.getPriority() != null)
            issue.setPriority(request.getPriority());

        issue.setUpdatedAt(LocalDateTime.now());

        Issue updated = issueRepository.save(issue);
        return convertToDTO(updated);
    }

}
