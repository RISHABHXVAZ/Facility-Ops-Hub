package com.facilityops.facility_ops_hub.repositories;

import com.facilityops.facility_ops_hub.models.Comment;
import com.facilityops.facility_ops_hub.models.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByIssueOrderByCreatedAtAsc(Issue issue);
}
