package com.facilityops.facility_ops_hub.models;

import com.facilityops.facility_ops_hub.models.enums.ActivityType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Table(name = "issue_activity")
public class IssueActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Issue issue;

    @ManyToOne
    private User performedBy;   // <-- REQUIRED FIELD

    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    private String details;

    private LocalDateTime timestamp = LocalDateTime.now();
}
