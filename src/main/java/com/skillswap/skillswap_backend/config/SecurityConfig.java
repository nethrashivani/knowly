package com.skillswap.skillswap_backend.config;

import com.skillswap.skillswap_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

   @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                    .requestMatchers(HttpMethod.GET, "/api/ratings/user/**").permitAll()
                    .requestMatchers("/api/ratings/**").authenticated()

                    .requestMatchers(HttpMethod.GET, "/api/profile/user/**").permitAll()
                    .requestMatchers("/api/profile/**").authenticated()

                    // WORKSHOPS
                    .requestMatchers(HttpMethod.GET, "/api/workshops/**").permitAll()
                    .requestMatchers("/api/workshops/**").authenticated()

                    // WORKSHOP APPLICATIONS
                    .requestMatchers("/api/workshop-applications/**").authenticated()

                    // SKILLS
                    .requestMatchers(HttpMethod.GET, "/api/skills/my").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/skills/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/skills/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/skills/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/skills/**").authenticated()

                    // NOTIFICATIONS
                    .requestMatchers("/api/notifications/**").authenticated()

                    .anyRequest().authenticated()
            )
            .addFilterBefore(
                    jwtAuthFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

    return http.build();
}

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByEmail(username)
                .map(user -> {
                    UserDetails userDetails = User.withUsername(user.getEmail())
                            .password(user.getPassword())
                            .roles(user.getRole().name())
                            .build();
                    return userDetails;
                })
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5174", "http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        return new UrlBasedCorsConfigurationSource() {
            {
                registerCorsConfiguration("/**", config);
            }
        };
    }
}
