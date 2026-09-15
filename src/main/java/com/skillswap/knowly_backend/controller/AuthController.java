package com.skillswap.knowly_backend.controller;

import com.skillswap.skillswap_backend.dto.AuthResponse;
import com.skillswap.skillswap_backend.dto.LoginRequest;
import com.skillswap.skillswap_backend.dto.RegisterRequest;
import com.skillswap.skillswap_backend.dto.ResendOtpRequest;
import com.skillswap.skillswap_backend.dto.VerifyOtpRequest;
import com.skillswap.skillswap_backend.service.AuthService;
import com.skillswap.skillswap_backend.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://knowly-ph.vercel.app",
        "https://knowly-oit-main-nethh1.vercel.app"
})
@Tag(name = "Auth API", description = "Register and Login")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/register")
    @Operation(summary = "Start registration and send OTP")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok(
                "OTP sent successfully. Please verify your email."
        );
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify email OTP and complete registration")
    public ResponseEntity<?> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        AuthResponse response = authService.verifyRegistrationOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend email verification OTP")
    public ResponseEntity<?> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        otpService.generateAndSendOtp(request.getEmail());

        return ResponseEntity.ok(
                "A new OTP has been sent to your email."
        );
    }
}