package com.versammlungsassistent.controller;

import com.versammlungsassistent.dto.AgendaItemRequest;
import com.versammlungsassistent.dto.MeetingRequest;
import com.versammlungsassistent.dto.MeetingResultsRequest;
import com.versammlungsassistent.model.Meeting;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.service.MeetingEmailService;
import com.versammlungsassistent.service.MeetingService;
import com.versammlungsassistent.service.UserService;
import com.versammlungsassistent.util.JwtUtil;
import com.versammlungsassistent.util.PdfGenerator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
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

        LocalDateTime meetingDate = LocalDateTime.parse(request.getDateTime());
        if (meetingDate.isBefore(LocalDateTime.now().plusDays(7))) {
            return ResponseEntity.badRequest().body("Das Meeting muss mindestens 7 Tage im Voraus geplant werden.");
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
        response.put("userStimmen", user.getStimmen() != null ? user.getStimmen() : 0);
        response.put("challenges", meeting.getChallenges());

        if (meeting.getResultsSentAt() != null) {
            response.put("challengeDeadline", meeting.getResultsSentAt().plusDays(30));
        }

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

        if (user.getStimmen() == null || user.getStimmen() < 10) {
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

    @PostMapping("/{id}/results")
    public ResponseEntity<?> sendResults(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token,
            @RequestBody MeetingResultsRequest request
    ) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();
        Meeting meeting = meetingService.findById(id);

        if (!meeting.getCompany().equals(user.getCompany()) || !"2".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Nicht berechtigt.");
        }

        meeting.setResultsText(request.getResultsText());
        meeting.setResultsSentAt(LocalDateTime.now());
        meetingService.save(meeting);

        try {
            byte[] pdf = PdfGenerator.generateResultsPdf(meeting.getTitle(), request.getResultsText());
            meetingEmailService.sendResultsToParticipants(meeting, pdf);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Fehler beim Erstellen oder Versenden des PDFs.");
        }

        return ResponseEntity.ok("Beschlussergebnisse versendet.");
    }


    @GetMapping("/latest")
    public ResponseEntity<?> getLatestMeetings(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();

        List<Meeting> meetings = meetingService.findLatestMeetingsByCompany(user.getCompany().getId());

        List<Map<String, Object>> response = meetings.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("title", m.getTitle());
            map.put("dateTime", m.getDateTime());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-latest")
    public ResponseEntity<?> getMyLatestMeetings(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();

        // Alle Meetings der Firma holen
        List<Meeting> meetings = meetingService.findMeetingsByCompany(user.getCompany());

        // Nur Meetings filtern, wo der Gesellschafter Teilnehmer war
        List<Meeting> myMeetings = meetings.stream()
                .filter(m -> m.getParticipants().contains(email))
                .sorted((m1, m2) -> m2.getDateTime().compareTo(m1.getDateTime())) // Neueste zuerst
                .limit(5)
                .toList();

        return ResponseEntity.ok(myMeetings);
    }


    @GetMapping("/check-yearly")
    public ResponseEntity<?> checkYearlyMeeting(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();

        boolean exists = meetingService.existsMeetingInCurrentYear(user.getCompany().getId());
        if (exists) {
            return ResponseEntity.ok("Generalversammlung vorhanden.");
        } else {
            return ResponseEntity.status(404).body("Dieses Jahr wurde noch keine Generalversammlung durchgeführt.");
        }
    }


    @PostMapping("/{id}/challenge")
    public ResponseEntity<?> challengeMeeting(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();

        Meeting meeting = meetingService.findById(id);

        if (!meeting.getCompany().equals(user.getCompany())) {
            return ResponseEntity.status(403).body("Nicht berechtigt.");
        }

        if (!meeting.getParticipants().contains(user.getEmail())) {
            return ResponseEntity.status(403).body("Nur Teilnehmer dürfen anfechten.");
        }

        if (meeting.getResultsSentAt() == null) {
            return ResponseEntity.badRequest().body("Keine Beschlussergebnisse vorhanden.");
        }

        if (meeting.getResultsSentAt().plusMonths(1).isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Frist für Anfechtung ist abgelaufen.");
        }

        meeting.getChallenges().add(user.getEmail());
        meetingService.save(meeting);

        return ResponseEntity.ok("Anfechtung erfolgreich eingereicht.");
    }


}
