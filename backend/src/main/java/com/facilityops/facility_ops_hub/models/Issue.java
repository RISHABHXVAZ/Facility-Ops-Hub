package com.facilityops.facility_ops_hub.models;
import com.facilityops.facility_ops_hub.models.enums.IssueStatus;


import jakarta.annotation.Priority;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
public class Issue {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private IssueStatus status;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    private LocalDateTime slaDeadline;

    // Who raised the issue (Ranger)
    @ManyToOne
    private User createdBy;

    // Assigned engineer
    @ManyToOne
    private User assignedTo;
}

