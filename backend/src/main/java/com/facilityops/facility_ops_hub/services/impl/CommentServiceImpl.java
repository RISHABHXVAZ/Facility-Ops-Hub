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
import com.facilityops.facility_ops_hub.services.CommentService;
import com.facilityops.facility_ops_hub.services.IssueActivityService;
import com.facilityops.facility_ops_hub.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private NotificationService notificationService;
    private final IssueActivityService activityService;

    @Override
    public CommentDTO addComment(Long issueId, CommentRequest request, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // PERMISSION RULES
        if (user.getRole() == Role.RANGER &&
                !issue.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You can only comment on your own issues");
        }

        if (user.getRole() == Role.ENGINEER &&
                (issue.getAssignedTo() == null ||
                        !issue.getAssignedTo().getId().equals(user.getId()))) {
            throw new RuntimeException("You can only comment on issues assigned to you");
        }

        // Admin → no restriction

        Comment c = new Comment();
        c.setMessage(request.getMessage());
        c.setCreatedBy(user);
        c.setIssue(issue);

        commentRepository.save(c);

        activityService.logActivity(
                issue,
                user,
                ActivityType.COMMENT_ADDED,
                "Added a comment"
        );


        // Notify issue creator
        if (!user.getId().equals(issue.getCreatedBy().getId())) {
            notificationService.notify(issue.getCreatedBy(),
                    user.getName() + " commented on your issue #" + issue.getId());
        }

// Notify engineer
        if (issue.getAssignedTo() != null &&
                !user.getId().equals(issue.getAssignedTo().getId())) {

            notificationService.notify(issue.getAssignedTo(),
                    user.getName() + " added a comment on issue #" + issue.getId());
        }


        return convertToDTO(c);
    }

    @Override
    public List<CommentDTO> getComments(Long issueId, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

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
