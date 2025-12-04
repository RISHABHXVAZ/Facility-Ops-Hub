package com.facilityops.facility_ops_hub.models.dto;
import com.facilityops.facility_ops_hub.models.enums.Role;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
