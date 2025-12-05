package com.facilityops.facility_ops_hub.controllers;

import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.CommentDTO;
import com.facilityops.facility_ops_hub.models.dto.CommentRequest;
import com.facilityops.facility_ops_hub.services.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues/{issueId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public CommentDTO addComment(@PathVariable Long issueId,
                                 @RequestBody CommentRequest request,
                                 @AuthenticationPrincipal User user) {
        return commentService.addComment(issueId, request, user);
    }

    @GetMapping
    public List<CommentDTO> getComments(@PathVariable Long issueId,
                                        @AuthenticationPrincipal User user) {
        return commentService.getComments(issueId, user);
    }
}
