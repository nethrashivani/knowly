package com.skillswap.knowly_backend.service;

import com.skillswap.skillswap_backend.config.JwtUtil;
import com.skillswap.skillswap_backend.dto.AuthResponse;
import com.skillswap.skillswap_backend.dto.LoginRequest;
import com.skillswap.skillswap_backend.dto.RegisterRequest;
import com.skillswap.skillswap_backend.entity.PendingRegistration;
import com.skillswap.skillswap_backend.entity.User;
import com.skillswap.skillswap_backend.repository.PendingRegistrationRepository;
import com.skillswap.skillswap_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        /*
         * If the user previously started registration but did not
         * complete OTP verification, remove that old pending record.
         *
         * We explicitly flush the DELETE before inserting the new
         * pending registration to avoid a duplicate-email constraint
         * error caused by Hibernate delaying the DELETE.
         */
        pendingRegistrationRepository
                .findByEmail(request.getEmail())
                .ifPresent(existingRegistration -> {
                    pendingRegistrationRepository.delete(existingRegistration);
                    pendingRegistrationRepository.flush();
                });

        PendingRegistration pendingRegistration =
                PendingRegistration.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .password(
                                passwordEncoder.encode(request.getPassword())
                        )
                        .build();

        pendingRegistrationRepository.save(pendingRegistration);

        // Send OTP to the user's email.
        otpService.generateAndSendOtp(request.getEmail());

        // The real User account is created only after OTP verification.
        return null;
    }

    @Transactional
    public AuthResponse verifyRegistrationOtp(
            String email,
            String otp) {

        boolean verified = otpService.verifyOtp(email, otp);

        if (!verified) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        PendingRegistration pendingRegistration =
                pendingRegistrationRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration request not found"
                                ));

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(pendingRegistration.getName())
                .email(pendingRegistration.getEmail())
                .password(pendingRegistration.getPassword())
                .role(User.Role.BOTH)
                .build();

        userRepository.save(user);

        /*
         * Remove the temporary registration after the real
         * account has been created.
         */
        pendingRegistrationRepository.delete(pendingRegistration);

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}