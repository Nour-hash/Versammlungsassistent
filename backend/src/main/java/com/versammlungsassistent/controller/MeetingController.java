package com.versammlungsassistent.controller;

import com.versammlungsassistent.dto.MeetingRequest;
import com.versammlungsassistent.model.Meeting;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.service.MeetingEmailService;
import com.versammlungsassistent.service.MeetingService;
import com.versammlungsassistent.service.UserService;
import com.versammlungsassistent.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
