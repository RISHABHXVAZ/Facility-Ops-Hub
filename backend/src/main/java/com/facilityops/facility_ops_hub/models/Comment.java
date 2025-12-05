package com.facilityops.facility_ops_hub.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    private User user;  // who wrote the comment

    @ManyToOne
    private Issue issue; // which issue this comment belongs to
}
