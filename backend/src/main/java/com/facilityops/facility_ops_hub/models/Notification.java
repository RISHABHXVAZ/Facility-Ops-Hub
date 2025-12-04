package com.facilityops.facility_ops_hub.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private boolean isRead = false;

    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne
    private User recipient;  // receiver
}

