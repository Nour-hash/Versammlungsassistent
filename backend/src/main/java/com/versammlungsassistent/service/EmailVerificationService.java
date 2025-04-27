package com.versammlungsassistent.service;

import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class EmailVerificationService {

    private final MailjetEmailService mailService;
    // Map: email → letzter Code
    private final ConcurrentMap<String, String> codes = new ConcurrentHashMap<>();

    public EmailVerificationService(MailjetEmailService mailService) {
        this.mailService = mailService;
    }

    public void generateAndSendCode(String email) {
        // Zufälligen 6-stelligen Code erzeugen
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        codes.put(email, code);
        mailService.sendEmail(
            email,
            "Ihr Login-Code",
            "Ihr einmaliger Login-Code lautet: " + code
        );
    }

    public boolean verifyCode(String email, String code) {
        String saved = codes.get(email);
        if (saved != null && saved.equals(code)) {
            codes.remove(email);
            return true;
        }
        return false;
    }
}
