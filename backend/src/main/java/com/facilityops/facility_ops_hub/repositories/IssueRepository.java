package com.facilityops.facility_ops_hub.repositories;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByCreatedBy(User user);

    List<Issue> findByAssignedTo(User engineer);

    List<Issue> findByStatus(IssueStatus status);
}
