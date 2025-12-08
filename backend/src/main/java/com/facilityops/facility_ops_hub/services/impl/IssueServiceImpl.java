package com.facilityops.facility_ops_hub.services.impl;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.IssueDTO;
import com.facilityops.facility_ops_hub.models.dto.IssueRequest;
import com.facilityops.facility_ops_hub.models.dto.UpdateIssueRequest;
import com.facilityops.facility_ops_hub.models.dto.UpdateIssueStatusRequest;
import com.facilityops.facility_ops_hub.models.enums.ActivityType;
import com.facilityops.facility_ops_hub.models.enums.IssueStatus;
import com.facilityops.facility_ops_hub.models.enums.Role;
import com.facilityops.facility_ops_hub.repositories.IssueRepository;
import com.facilityops.facility_ops_hub.repositories.UserRepository;
import com.facilityops.facility_ops_hub.services.IssueActivityService;
import com.facilityops.facility_ops_hub.services.IssueService;
import com.facilityops.facility_ops_hub.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final UserRepository userRepository;
    private final IssueRepository issueRepository;
    private final NotificationService notificationService;
    private final IssueActivityService activityService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    private void wsNotify(User user, String message) {
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), message);
    }

    private void wsNotifyRole(Role role, String message) {
        userRepository.findByRole(role).forEach(u -> wsNotify(u, message));
    }


    @Override
    public IssueDTO createIssue(IssueRequest request, User user) {

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setPriority(request.getPriority());
        issue.setStatus(IssueStatus.OPEN);
        issue.setCreatedBy(user);

        issueRepository.save(issue);

        activityService.logActivity(
                issue,
                user,
                ActivityType.ISSUE_CREATED,
                "Issue created by " + user.getName()
        );

        String msg = "A new issue #" + issue.getId() + " was created by " + user.getName();

        // WS supervisor + admin notify
        wsNotifyRole(Role.ADMIN, msg);
        wsNotifyRole(Role.SUPERVISOR, msg);

        // DB supervisor + admin notify
        userRepository.findByRole(Role.ADMIN).forEach(a -> notificationService.notify(a, msg));
        userRepository.findByRole(Role.SUPERVISOR).forEach(s -> notificationService.notify(s, msg));

        LocalDateTime now = LocalDateTime.now();

        switch (issue.getPriority()) {
            case CRITICAL -> issue.setSlaDeadline(now.plusHours(4));
            case HIGH     -> issue.setSlaDeadline(now.plusHours(24));
            case MEDIUM   -> issue.setSlaDeadline(now.plusHours(48));
            case LOW      -> issue.setSlaDeadline(now.plusHours(72));
        }

        issueRepository.save(issue);



        return convertToDTO(issue);
    }

    @Override
    public List<IssueDTO> getMyIssues(User user) {
        return issueRepository.findByCreatedBy(user)
                .stream().map(this::convertToDTO).toList();
    }

    @Override
    public List<IssueDTO> getAssignedIssues(User engineer) {
        return issueRepository.findByAssignedTo(engineer)
                .stream().map(this::convertToDTO).toList();
    }

    @Override
    public List<IssueDTO> getAllIssues() {
        return issueRepository.findAll()
                .stream().map(this::convertToDTO).toList();
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

        dto.setSlaDeadline(issue.getSlaDeadline());
        dto.setSlaBreached(issue.isSlaBreached());
        dto.setSlaBreachedAt(issue.getSlaBreachedAt());

        return dto;
    }

    @Override
    public IssueDTO updateMyIssue(Long issueId, UpdateIssueRequest request, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // Only creator can update
        if (!issue.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Not allowed to update");
        }

        if (request.getTitle() != null) issue.setTitle(request.getTitle());
        if (request.getDescription() != null) issue.setDescription(request.getDescription());
        if (request.getPriority() != null) issue.setPriority(request.getPriority());

        issue.setUpdatedAt(LocalDateTime.now());
        issueRepository.save(issue);

        // WS notify supervisors + admins (but NOT self)
        String msg = "Issue #" + issue.getId() + " was updated by " + user.getName();
        wsNotifyRole(Role.SUPERVISOR, msg);
        wsNotifyRole(Role.ADMIN, msg);

        return convertToDTO(issue);
    }

    @Override
    public IssueDTO assignIssue(Long issueId, Long engineerId, User admin) {

        if (admin.getRole() != Role.ADMIN)
            throw new RuntimeException("Only admin can assign");

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User engineer = userRepository.findById(engineerId)
                .orElseThrow(() -> new RuntimeException("Engineer not found"));

        if (engineer.getRole() != Role.ENGINEER)
            throw new RuntimeException("User is not an engineer");

        issue.setAssignedTo(engineer);
        issue.setStatus(IssueStatus.ASSIGNED);
        issue.setUpdatedAt(LocalDateTime.now());
        issueRepository.save(issue);

        activityService.logActivity(
                issue,
                admin,
                ActivityType.ASSIGNED_TO_USER,
                "Assigned to engineer: " + engineer.getName()
        );

        String msg = "You have been assigned issue #" + issue.getId();

        // DB + WS notify
        notificationService.notify(engineer, msg);
        wsNotify(engineer, msg);

        return convertToDTO(issue);
    }

    @Override
    public IssueDTO updateStatus(Long issueId, UpdateIssueStatusRequest request, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        IssueStatus newStatus = request.getStatus();
        IssueStatus current = issue.getStatus();

        if (user.getRole() != Role.ENGINEER && user.getRole() != Role.ADMIN)
            throw new RuntimeException("Not allowed");

        if (user.getRole() == Role.ENGINEER &&
                (issue.getAssignedTo() == null || !issue.getAssignedTo().getId().equals(user.getId())))
            throw new RuntimeException("You are not assigned");

        boolean valid =
                (current == IssueStatus.OPEN && newStatus == IssueStatus.ASSIGNED) ||
                        (current == IssueStatus.ASSIGNED && newStatus == IssueStatus.IN_PROGRESS) ||
                        (current == IssueStatus.IN_PROGRESS && newStatus == IssueStatus.COMPLETED) ||
                        (current == IssueStatus.COMPLETED && newStatus == IssueStatus.CLOSED);

        if (!valid)
            throw new RuntimeException("Invalid transition");

        issue.setStatus(newStatus);
        issue.setUpdatedAt(LocalDateTime.now());
        issueRepository.save(issue);

        activityService.logActivity(
                issue,
                user,
                ActivityType.STATUS_CHANGED,
                "Status changed to " + newStatus
        );

        // ---------- CLOSED LOGIC ----------
        if (newStatus == IssueStatus.CLOSED) {

            // stop SLA timer
            if (LocalDateTime.now().isBefore(issue.getSlaDeadline())) {
                issue.setSlaBreached(false);
            }

            // already breached? keep as it is
            // else no need to update

            issueRepository.save(issue);  // 🔥 important


            String msg = "Issue #" + issueId + " has been CLOSED by " + user.getName();

            wsNotify(issue.getCreatedBy(), msg);
            wsNotifyRole(Role.ADMIN, msg);
            wsNotifyRole(Role.SUPERVISOR, msg);

            return convertToDTO(issue);
        }

        String msg = "Status updated for issue #" + issue.getId() + " → " + newStatus;

        notificationService.notify(issue.getCreatedBy(), msg);
        wsNotify(issue.getCreatedBy(), msg);

        return convertToDTO(issue);
    }

    @Override
    public void deleteIssue(Long issueId, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (user.getRole() == Role.ADMIN) {

            issueRepository.delete(issue);

            String msg = "Issue #" + issueId + " was deleted by Admin " + user.getName();

            wsNotify(issue.getCreatedBy(), msg);
            wsNotifyRole(Role.ADMIN, msg);
            wsNotifyRole(Role.SUPERVISOR, msg);

            activityService.logActivity(issue, user, ActivityType.ISSUE_CLOSED, msg);
            return;
        }

        if (issue.getCreatedBy().getId().equals(user.getId())) {

            if (issue.getStatus() != IssueStatus.OPEN)
                throw new RuntimeException("Can delete only OPEN issues");

            issueRepository.delete(issue);

            String msg = "Issue #" + issueId + " was deleted by " + user.getName();

            wsNotifyRole(Role.ADMIN, msg);
            wsNotifyRole(Role.SUPERVISOR, msg);

            activityService.logActivity(issue, user, ActivityType.ISSUE_CLOSED, msg);
            return;
        }

        throw new RuntimeException("Not allowed");
    }

    @Override
    public List<IssueDTO> getHistory(User user) {

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPERVISOR)
            return issueRepository.findAll()
                    .stream().map(this::convertToDTO).toList();

        if (user.getRole() == Role.ENGINEER)
            return issueRepository.findByAssignedTo(user)
                    .stream().map(this::convertToDTO).toList();

        return issueRepository.findByCreatedBy(user)
                .stream().map(this::convertToDTO).toList();
    }
}
