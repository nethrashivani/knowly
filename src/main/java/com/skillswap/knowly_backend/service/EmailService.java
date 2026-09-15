package com.skillswap.knowly_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String resendApiKey;
    private final String fromEmail;

    public EmailService(
            ObjectMapper objectMapper,
            @Value("${resend.api-key:}") String resendApiKey,
            @Value("${resend.from-email:onboarding@resend.dev}") String fromEmail) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.resendApiKey = resendApiKey;
        this.fromEmail = fromEmail;
    }

    public void sendEmail(String to, String subject, String body) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("Email not sent because RESEND_API_KEY is not configured.");
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", fromEmail);
            payload.put("to", List.of(to));
            payload.put("subject", subject);
            payload.put("text", body);

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "Resend email failed (HTTP " + response.statusCode() + "): " + response.body());
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to send email through Resend", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Email sending was interrupted", e);
        }
    }
}
