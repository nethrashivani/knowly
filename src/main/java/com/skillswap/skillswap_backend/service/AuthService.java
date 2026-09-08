package com.skillswap.skillswap_backend.service;

import com.skillswap.skillswap_backend.dto.AuthResponse;
import com.skillswap.skillswap_backend.dto.LoginRequest;
import com.skillswap.skillswap_backend.dto.RegisterRequest;
import com.skillswap.skillswap_backend.entity.User;
import com.skillswap.skillswap_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
    }
}
