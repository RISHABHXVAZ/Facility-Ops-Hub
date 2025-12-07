package com.facilityops.facility_ops_hub.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    @Column(name = "read_status", nullable = false)
    private boolean readStatus = false;

    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne
    private User user;  // receiver

}
