package com.facilityops.facility_ops_hub.repositories;

import com.facilityops.facility_ops_hub.models.IssueActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueActivityRepository extends JpaRepository<IssueActivity, Long> {

    List<IssueActivity> findByIssueIdOrderByTimestampAsc(Long issueId);
}
