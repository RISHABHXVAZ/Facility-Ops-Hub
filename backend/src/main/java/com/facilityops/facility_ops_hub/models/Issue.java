package com.facilityops.facility_ops_hub.models;
import com.facilityops.facility_ops_hub.models.enums.IssueStatus;


import com.facilityops.facility_ops_hub.models.enums.Priority;
import jakarta.persistence.*;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    // SLA system fields
// SLA system fields
    private LocalDateTime slaDeadline;

    @Column(nullable = false)
    private boolean slaBreached = false;

    private LocalDateTime slaBreachedAt;


    @ManyToOne
    private User createdBy;

    @ManyToOne
    private User assignedTo;
}

