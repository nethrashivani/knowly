package com.skillswap.knowly_backend.service;

import com.skillswap.skillswap_backend.entity.EmailOtp;
import com.skillswap.skillswap_backend.repository.EmailOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 5;

    private final SecureRandom secureRandom = new SecureRandom();

    public void generateAndSendOtp(String email) {

        // Mark any previous OTP for this email as used.
        emailOtpRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .ifPresent(previousOtp -> {
                    previousOtp.setUsed(true);
                    emailOtpRepository.save(previousOtp);
                });

        // Generate a secure 6-digit OTP.
        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        EmailOtp emailOtp = EmailOtp.builder()
                .email(email)
                .otp(otp)
                .expiresAt(
                        LocalDateTime.now()
                                .plusMinutes(OTP_EXPIRY_MINUTES)
                )
                .used(false)
                .build();

        emailOtpRepository.save(emailOtp);

        String subject = "Your Knowly verification code";

        String body = """
                Hi,

                Your Knowly email verification code is:

                %s

                This code will expire in 5 minutes.

                If you did not request this code, you can safely ignore this email.

                Regards,
                Knowly Team
                """.formatted(otp);

        emailService.sendEmail(email, subject, body);
    }

    public boolean verifyOtp(String email, String otp) {

        EmailOtp emailOtp = emailOtpRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElse(null);

        if (emailOtp == null) {
            return false;
        }

        if (emailOtp.isUsed()) {
            return false;
        }

        if (emailOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (!emailOtp.getOtp().equals(otp)) {
            return false;
        }

        emailOtp.setUsed(true);
        emailOtpRepository.save(emailOtp);

        return true;
    }
}