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
import com.versammlungsassistent.model.Vote;
import com.versammlungsassistent.model.VoteResult;
import com.versammlungsassistent.repository.VoteRepository;
import com.versammlungsassistent.repository.UserRepository;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.util.PdfGenerator;

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

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    public MeetingController(UserService userService, JwtUtil jwtUtil,
                             MeetingService meetingService,
                             MeetingEmailService meetingEmailService,
                             VoteRepository voteRepository,
                             UserRepository userRepository) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.meetingService = meetingService;
        this.meetingEmailService = meetingEmailService;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
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

        // ✅ Korrekte Prozentberechnung
        List<User> allUsers = userService.findByCompanyId(user.getCompany().getId());
        int totalStimmen = allUsers.stream()
                .filter(u -> u.getStimmen() != null)
                .mapToInt(User::getStimmen)
                .sum();

        if (totalStimmen == 0) {
            return ResponseEntity.badRequest().body("Keine Stimmen im System registriert.");
        }

        double userSharePercentage = (user.getStimmen() * 100.0) / totalStimmen;

        if (userSharePercentage < 10.0) {
            return ResponseEntity.status(403).body("Nicht berechtigt: weniger als 10% der Stimmen.");
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

    @DeleteMapping("/{meetingId}/agenda/{index}")
    public ResponseEntity<?> deleteAgendaItem(
            @PathVariable Long meetingId,
            @PathVariable int index,
            @RequestHeader("Authorization") String token
    ) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();
        Meeting meeting = meetingService.findById(meetingId);

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

        List<String> agenda = meeting.getAgendaItems();
        if (index < 0 || index >= agenda.size()) {
            return ResponseEntity.badRequest().body("Ungültiger Index.");
        }

        agenda.remove(index);
        meetingService.save(meeting);

        return ResponseEntity.ok(meeting);
    }

    @GetMapping("/{id}/generate-results")
    public ResponseEntity<?> generateMeetingResults(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow();
        Meeting meeting = meetingService.findById(id);

        if (!meeting.getCompany().equals(user.getCompany()) || !"2".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Nicht berechtigt.");
        }

        List<Vote> votes = voteRepository.findByCompanyId(user.getCompany().getId());

        StringBuilder resultsText = new StringBuilder();
        resultsText.append("Beschlussergebnisse der Versammlung: ").append(meeting.getTitle()).append("\n\n");

        for (Vote vote : votes) {
            if (vote.getStartTime().isAfter(meeting.getDateTime())) {
                continue; // Nur Votes berücksichtigen, die vor dem Meeting gestartet wurden
            }

            int ja = 0, nein = 0, enthalten = 0;
            double kapitalJa = 0, kapitalNein = 0, kapitalEnthalten = 0;
            double gesamtKapital = 0;

            for (VoteResult result : vote.getResults()) {
                User voter = userRepository.findById(result.getUserId()).orElse(null);
                double kapital = (voter != null && voter.getKapital() != null) ? voter.getKapital() : 0.0;
                gesamtKapital += kapital;
                switch (result.getResult().toLowerCase()) {
                    case "ja" -> {
                        ja++;
                        kapitalJa += kapital;
                    }
                    case "nein" -> {
                        nein++;
                        kapitalNein += kapital;
                    }
                    case "enthalten" -> {
                        enthalten++;
                        kapitalEnthalten += kapital;
                    }
                }
            }

            double kapitalAnwesend = kapitalJa + kapitalNein + kapitalEnthalten;
            boolean angenommen = (kapitalAnwesend >= 10.0) && (ja > (ja + nein + enthalten) / 2.0);

            resultsText.append("- Thema: ").append(vote.getTopic()).append("\n")
                    .append("  Ja-Stimmen: ").append(ja).append(" (Kapital: ").append(String.format("%.2f", kapitalJa)).append("%)\n")
                    .append("  Nein-Stimmen: ").append(nein).append(" (Kapital: ").append(String.format("%.2f", kapitalNein)).append("%)\n")
                    .append("  Enthaltungen: ").append(enthalten).append(" (Kapital: ").append(String.format("%.2f", kapitalEnthalten)).append("%)\n")
                    .append("  Beschluss: ").append(angenommen ? "Angenommen ✅" : "Abgelehnt ❌").append("\n\n");
        }

        return ResponseEntity.ok(resultsText.toString());
    }

}
