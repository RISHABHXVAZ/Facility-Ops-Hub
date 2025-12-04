package com.facilityops.facility_ops_hub.controllers;

import com.facilityops.facility_ops_hub.models.dto.AuthResponse;
import com.facilityops.facility_ops_hub.models.dto.LoginRequest;
import com.facilityops.facility_ops_hub.models.dto.RegisterRequest;
import com.facilityops.facility_ops_hub.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
