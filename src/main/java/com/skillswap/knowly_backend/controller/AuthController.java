package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.AuthResponse;
import com.skillswap.knowly_backend.dto.LoginRequest;
import com.skillswap.knowly_backend.dto.RegisterRequest;
import com.skillswap.knowly_backend.dto.ResendOtpRequest;
import com.skillswap.knowly_backend.dto.VerifyOtpRequest;
import com.skillswap.knowly_backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth API", description = "Register and Login")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Start registration and send email OTP")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok(
                "OTP sent to your email. Please verify it to complete registration."
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify email OTP and complete registration")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        AuthResponse response = authService.verifyRegistrationOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend email verification OTP")
    public ResponseEntity<String> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        authService.resendRegistrationOtp(request.getEmail());

        return ResponseEntity.ok(
                "A new OTP has been sent to your email."
        );
    }
}
