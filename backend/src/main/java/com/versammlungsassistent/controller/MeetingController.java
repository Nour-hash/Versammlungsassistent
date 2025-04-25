package com.versammlungsassistent.controller;

import com.versammlungsassistent.dto.AgendaItemRequest;
import com.versammlungsassistent.dto.MeetingRequest;
import com.versammlungsassistent.model.Meeting;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.service.MeetingEmailService;
import com.versammlungsassistent.service.MeetingService;
import com.versammlungsassistent.service.UserService;
import com.versammlungsassistent.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final MeetingService meetingService;
    private final MeetingEmailService meetingEmailService;

    public MeetingController(UserService userService, JwtUtil jwtUtil,
                             MeetingService meetingService,
                             MeetingEmailService meetingEmailService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.meetingService = meetingService;
        this.meetingEmailService = meetingEmailService;
    }

    // 1️⃣ Meeting erstellen + Einladungen senden
    @PostMapping
    public ResponseEntity<String> createMeeting(
            @RequestHeader("Authorization") String token,
            @RequestBody MeetingRequest request
    ) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User initiator = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"2".equals(initiator.getRole())) {
            return ResponseEntity.status(403).body("Nur Geschäftsführer können Einladungen erstellen.");
        }

        Meeting saved = meetingService.saveMeeting(request, initiator);
        meetingEmailService.sendInvitations(saved);

        return ResponseEntity.ok("Einladung gespeichert und versendet.");
    }

    // 2️⃣ Meetingdaten abrufen (inkl. agenda & shares)
    @GetMapping("/{id}")
    public ResponseEntity<?> getMeeting(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();

        Meeting meeting = meetingService.findById(id);
        if (!meeting.getCompany().equals(user.getCompany())) {
            return ResponseEntity.status(403).body("Nicht berechtigt");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("title", meeting.getTitle());
        response.put("dateTime", meeting.getDateTime());
        response.put("meetingType", meeting.getMeetingType());
        response.put("locationOrLink", meeting.getLocationOrLink());
        response.put("agendaItems", meeting.getAgendaItems());
        response.put("userShares", user.getShares() != null ? user.getShares() : 0);

        return ResponseEntity.ok(response);
    }

    // 3️⃣ Tagesordnungspunkt hinzufügen (nur berechtigte Gesellschafter)
    @PostMapping("/{id}/agenda")
    public ResponseEntity<?> addAgendaItem(
            @PathVariable Long id,
            @RequestBody AgendaItemRequest request,
            @RequestHeader("Authorization") String token
    ) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();
        Meeting meeting = meetingService.findById(id);

        if (!meeting.getCompany().equals(user.getCompany())) {
            return ResponseEntity.status(403).body("Nicht berechtigt: andere Firma.");
        }

        if (user.getShares() == null || user.getShares() < 10) {
            return ResponseEntity.status(403).body("Nicht berechtigt: weniger als 10% Anteile.");
        }

        long days = Duration.between(LocalDateTime.now(), meeting.getDateTime()).toDays();
        if (days < 3) {
            return ResponseEntity.status(403).body("Tagesordnung kann 3 Tage vor Versammlung nicht mehr verändert werden.");
        }

        meeting.getAgendaItems().add(request.getAgendaItem());
        meetingService.save(meeting);

        return ResponseEntity.ok(meeting);
    }
}
