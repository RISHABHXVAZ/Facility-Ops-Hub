package com.facilityops.facility_ops_hub.models;
import com.facilityops.facility_ops_hub.models.enums.Role;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;   // ADMIN, SUPERVISOR, ENGINEER, RANGER

    private boolean active = true;
}
