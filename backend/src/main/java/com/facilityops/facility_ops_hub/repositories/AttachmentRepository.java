package com.facilityops.facility_ops_hub.repositories;

import com.facilityops.facility_ops_hub.models.Attachment;
import com.facilityops.facility_ops_hub.models.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByIssue(Issue issue);
}
