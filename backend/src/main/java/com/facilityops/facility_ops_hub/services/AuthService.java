package com.facilityops.facility_ops_hub.services;

import com.facilityops.facility_ops_hub.models.dto.AuthResponse;
import com.facilityops.facility_ops_hub.models.dto.LoginRequest;
import com.facilityops.facility_ops_hub.models.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
