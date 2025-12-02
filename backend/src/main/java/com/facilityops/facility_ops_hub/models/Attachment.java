package com.facilityops.facility_ops_hub.models;

import jakarta.persistence.*;

@Entity
@Table(name = "attachments")
public class Attachment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileUrl;

    @ManyToOne
    private Issue issue;
}

