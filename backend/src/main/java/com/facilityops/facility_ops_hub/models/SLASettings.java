package com.facilityops.facility_ops_hub.models;

import jakarta.persistence.*;

@Entity
@Table(name = "sla_settings")
public class SLASettings{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int criticalHours;
    private int highHours;
    private int mediumHours;
    private int lowHours;
}

