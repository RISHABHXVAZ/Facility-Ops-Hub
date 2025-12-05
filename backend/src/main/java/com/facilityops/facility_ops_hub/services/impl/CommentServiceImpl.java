package com.facilityops.facility_ops_hub.services.impl;

import com.facilityops.facility_ops_hub.models.Comment;
import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.CommentDTO;
import com.facilityops.facility_ops_hub.models.dto.CommentRequest;
import com.facilityops.facility_ops_hub.models.enums.ActivityType;
import com.facilityops.facility_ops_hub.models.enums.Role;
import com.facilityops.facility_ops_hub.repositories.CommentRepository;
import com.facilityops.facility_ops_hub.repositories.IssueRepository;
import com.facilityops.facility_ops_hub.repositories.UserRepository;
import com.facilityops.facility_ops_hub.services.CommentService;
import com.facilityops.facility_ops_hub.services.IssueActivityService;
import com.facilityops.facility_ops_hub.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final IssueActivityService activityService;
    private final UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    private void checkCommentPermission(Issue issue, User user) {

        if (user.getRole() == Role.ADMIN) return;         // full access
        if (user.getRole() == Role.SUPERVISOR) return;    // supervisors oversee all

        if (user.getRole() == Role.RANGER &&
                !issue.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Rangers can comment only on their own issues");
        }

        if (user.getRole() == Role.ENGINEER &&
                (issue.getAssignedTo() == null ||
                        !issue.getAssignedTo().getId().equals(user.getId()))) {
            throw new RuntimeException("Engineers can comment only on assigned issues");
        }
    }


    @Override
    public CommentDTO addComment(Long issueId, CommentRequest request, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // Permission check
        checkCommentPermission(issue, user);

        Comment c = new Comment();
        c.setMessage(request.getMessage());
        c.setCreatedBy(user);
        c.setIssue(issue);

        commentRepository.save(c);

        // Log activity
        activityService.logActivity(
                issue,
                user,
                ActivityType.COMMENT_ADDED,
                "Added a comment"
        );


        messagingTemplate.convertAndSend(
                "/topic/comments/" + issueId,
                convertToDTO(c)
        );


        String notifyMsg = user.getName() + " commented on Issue #" + issue.getId();


        // Notify issue creator (if not same person)
        if (!user.getId().equals(issue.getCreatedBy().getId())) {
            notificationService.notify(issue.getCreatedBy(), notifyMsg);
            messagingTemplate.convertAndSend("/topic/notifications/" + issue.getCreatedBy().getId(), notifyMsg);
        }

        // Notify engineer (if exists & not same person)
        if (issue.getAssignedTo() != null &&
                !user.getId().equals(issue.getAssignedTo().getId())) {

            notificationService.notify(issue.getAssignedTo(), notifyMsg);
            messagingTemplate.convertAndSend("/topic/notifications/" + issue.getAssignedTo().getId(), notifyMsg);
        }

        // Notify supervisors
        if (user.getRole() != Role.SUPERVISOR) {
            userRepository.findByRole(Role.SUPERVISOR).forEach(sup -> {
                notificationService.notify(sup, notifyMsg);
                messagingTemplate.convertAndSend("/topic/notifications/" + sup.getId(), notifyMsg);
            });
        }

        // Notify admins
        userRepository.findByRole(Role.ADMIN).forEach(admin -> {
            notificationService.notify(admin, notifyMsg);
            messagingTemplate.convertAndSend("/topic/notifications/" + admin.getId(), notifyMsg);
        });

        return convertToDTO(c);
    }

    @Override
    public List<CommentDTO> getComments(Long issueId, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // Permission check (same rules as adding)
        checkCommentPermission(issue, user);

        return commentRepository.findByIssueOrderByCreatedAtAsc(issue)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    private CommentDTO convertToDTO(Comment c) {
        CommentDTO dto = new CommentDTO();

        dto.setId(c.getId());
        dto.setMessage(c.getMessage());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setCreatedById(c.getCreatedBy().getId());
        dto.setCreatedByName(c.getCreatedBy().getName());
        dto.setIssueId(c.getIssue().getId());

        return dto;
    }
}
