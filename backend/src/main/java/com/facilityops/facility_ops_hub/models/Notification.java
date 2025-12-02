package com.facilityops.facility_ops_hub.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private boolean readStatus = false;

    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne
    private User user;  // receiver
}

