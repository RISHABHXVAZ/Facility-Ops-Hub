package com.facilityops.facility_ops_hub.repositories;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.models.User;
import com.facilityops.facility_ops_hub.models.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByCreatedBy(User user);

    List<Issue> findByAssignedTo(User engineer);

    List<Issue> findByStatus(IssueStatus status);

    List<Issue> findByCreatedById(Long userId);

    List<Issue> findByAssignedToId(Long userId);

    @Query("SELECT i FROM Issue i WHERE i.slaDeadline < CURRENT_TIMESTAMP AND i.slaBreached = false AND i.status <> 'CLOSED'")
    List<Issue> findOverdueIssues();



}
