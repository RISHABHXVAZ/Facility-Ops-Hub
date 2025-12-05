package com.facilityops.facility_ops_hub.services;

import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.dto.CommentDTO;
import com.facilityops.facility_ops_hub.models.dto.CommentRequest;

import java.util.List;

public interface CommentService {

    CommentDTO addComment(Long issueId, CommentRequest request, User user);

    List<CommentDTO> getComments(Long issueId, User user);
}
