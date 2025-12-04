package com.facilityops.facility_ops_hub.models.dto;

import com.facilityops.facility_ops_hub.models.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
}

