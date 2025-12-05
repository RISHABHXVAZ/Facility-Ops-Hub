package com.facilityops.facility_ops_hub.services.impl;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.IssueDTO;
import com.facilityops.facility_ops_hub.models.dto.IssueRequest;
import com.facilityops.facility_ops_hub.models.dto.UpdateIssueRequest;
import com.facilityops.facility_ops_hub.models.dto.UpdateIssueStatusRequest;
import com.facilityops.facility_ops_hub.models.enums.IssueStatus;
import com.facilityops.facility_ops_hub.models.enums.Role;
import com.facilityops.facility_ops_hub.repositories.IssueRepository;
import com.facilityops.facility_ops_hub.repositories.NotificationRepository;
import com.facilityops.facility_ops_hub.repositories.UserRepository;
import com.facilityops.facility_ops_hub.services.IssueService;
import com.facilityops.facility_ops_hub.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final UserRepository userRepository;
    private final IssueRepository issueRepository;
    private final NotificationService notificationService;

    @Override
    public IssueDTO createIssue(IssueRequest request, User user) {

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setPriority(request.getPriority());
        issue.setStatus(IssueStatus.OPEN);
        issue.setCreatedBy(user);

        issueRepository.save(issue);
        userRepository.findByRole(Role.ADMIN)
                .forEach(admin -> notificationService.notify(admin,
                        "A new issue was created by " + user.getName()));



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

    @Override
    public IssueDTO assignIssue(Long issueId, Long engineerId, User admin) {

        // Only admin can assign
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admin can assign issues");
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User engineer = userRepository.findById(engineerId)
                .orElseThrow(() -> new RuntimeException("Engineer not found"));

        if (engineer.getRole() != Role.ENGINEER) {
            throw new RuntimeException("Selected user is not an engineer");
        }

        issue.setAssignedTo(engineer);
        issue.setStatus(IssueStatus.ASSIGNED);
        issue.setUpdatedAt(LocalDateTime.now());

        Issue saved = issueRepository.save(issue);

        notificationService.notify(engineer,
                "You have been assigned issue #" + issue.getId());

        return convertToDTO(saved);
    }

    @Override
    public IssueDTO updateStatus(Long issueId, UpdateIssueStatusRequest request, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        IssueStatus newStatus = request.getStatus();

        // Only engineer assigned OR admin can update
        if (user.getRole() != Role.ENGINEER && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only engineers or admin can update status");
        }

        // Engineer check
        if (user.getRole() == Role.ENGINEER) {
            if (issue.getAssignedTo() == null || !issue.getAssignedTo().getId().equals(user.getId())) {
                throw new RuntimeException("You are not assigned to this issue");
            }
        }

        // Allowed transitions
        IssueStatus current = issue.getStatus();

        boolean valid = false;

        if (current == IssueStatus.OPEN && newStatus == IssueStatus.ASSIGNED)
            valid = true;

        if (current == IssueStatus.ASSIGNED && newStatus == IssueStatus.IN_PROGRESS)
            valid = true;

        if (current == IssueStatus.IN_PROGRESS && newStatus == IssueStatus.COMPLETED)
            valid = true;

        if (current == IssueStatus.COMPLETED && newStatus == IssueStatus.CLOSED)
            valid = true;


        // Update status
        issue.setStatus(newStatus);
        issue.setUpdatedAt(LocalDateTime.now());

        issueRepository.save(issue);

        notificationService.notify(issue.getCreatedBy(),
                "Status updated for issue #" + issue.getId() + " → " + newStatus);


        return convertToDTO(issue);
    }

    @Override
    public void deleteIssue(Long issueId, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (user.getRole() == Role.ADMIN) {
            issueRepository.delete(issue);
            return;
        }

        if (issue.getCreatedBy().getId().equals(user.getId())) {

            if (issue.getStatus() != IssueStatus.OPEN) {
                throw new RuntimeException("You can only delete issues that are still OPEN");
            }

            issueRepository.delete(issue);
            return;
        }

        throw new RuntimeException("You are not allowed to delete this issue");
    }

    @Override
    public List<IssueDTO> getHistory(User user) {

        // ADMIN → full history
        if (user.getRole() == Role.ADMIN) {
            return issueRepository.findAll()
                    .stream()
                    .map(this::convertToDTO)
                    .toList();
        }

        // ENGINEER → all issues ever assigned to them
        if (user.getRole() == Role.ENGINEER) {
            return issueRepository.findByAssignedTo(user)
                    .stream()
                    .map(this::convertToDTO)
                    .toList();
        }

        // USER → all issues created by them
        return issueRepository.findByCreatedBy(user)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


}
