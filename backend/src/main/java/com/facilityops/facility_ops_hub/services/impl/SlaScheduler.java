package com.facilityops.facility_ops_hub.services.impl;

import com.facilityops.facility_ops_hub.models.Issue;
import com.facilityops.facility_ops_hub.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlaScheduler {

    private final IssueRepository issueRepository;

    @Autowired
    private SimpMessagingTemplate messaging;  // WebSocket notifier

    /**
     * Runs every 1 minute and checks if SLA has been breached.
     */
    @Scheduled(fixedRate = 60000)  // 60 seconds
    public void checkSlaBreaches() {

        // find all issues whose deadline passed and are not marked breached
        List<Issue> overdue = issueRepository.findOverdueIssues();

        if (overdue.isEmpty()) return;

        overdue.forEach(issue -> {
            issue.setSlaBreached(true);
            issue.setSlaBreachedAt(LocalDateTime.now());
        });

        issueRepository.saveAll(overdue);

        // send WS notifications for each breached issue
        overdue.forEach(issue -> {
            messaging.convertAndSend("/topic/sla", "SLA_BREACHED:" + issue.getId());
        });
    }
}
