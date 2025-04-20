package com.versammlungsassistent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class MailjetEmailService {

    @Value("${mailjet.api.public}")
    private String publicKey;

    @Value("${mailjet.api.private}")
    private String privateKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(String to, String subject, String messageBody) {
        String url = "https://api.mailjet.com/v3.1/send";

        Map<String, Object> message = new HashMap<>();
        message.put("From", Map.of(
                "Email", "nour.nassar@stud.fh-campuswien.ac.at",
                "Name", "Versammlungsassistent"
        ));
        message.put("To", List.of(Map.of(
                "Email", to,
                "Name", to.split("@")[0]
        )));
        message.put("Subject", subject);
        message.put("TextPart", messageBody);

        Map<String, Object> requestBody = Map.of("Messages", List.of(message));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(publicKey, privateKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        System.out.println("📨 Mailjet Response: " + response.getStatusCode());
        System.out.println("🧾 Body: " + response.getBody());
    }
}
