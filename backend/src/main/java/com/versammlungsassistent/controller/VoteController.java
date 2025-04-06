package com.versammlungsassistent.controller;

import com.versammlungsassistent.model.User;
import com.versammlungsassistent.model.Vote;
import com.versammlungsassistent.repository.VoteRepository;
import com.versammlungsassistent.service.UserService;
import com.versammlungsassistent.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteRepository voteRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public VoteController(VoteRepository voteRepository, UserService userService, JwtUtil jwtUtil) {
        this.voteRepository = voteRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createVote(@RequestHeader("Authorization") String token, @RequestBody Vote vote) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!"2".equals(user.getRole())) { // Only Geschäftsführer can create votes
            return ResponseEntity.status(403).body("Access denied: Only Geschäftsführer can create votes");
        }

        vote.setCompany(user.getCompany());
        voteRepository.save(vote);
        return ResponseEntity.ok("Vote created successfully");
    }

    @PostMapping("/{voteId}/submit")
    public ResponseEntity<String> submitVote(@RequestHeader("Authorization") String token, @PathVariable Long voteId, @RequestBody String result) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Vote vote = voteRepository.findById(voteId).orElseThrow(() -> new RuntimeException("Vote not found"));

        if (!vote.getCompany().equals(user.getCompany())) {
            return ResponseEntity.status(403).body("Access denied: You can only vote in your company");
        }

        vote.getResults().add(result);
        voteRepository.save(vote);
        return ResponseEntity.ok("Vote submitted successfully");
    }

    @GetMapping("/company")
    public ResponseEntity<List<Vote>> getVotesForCompany(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<Vote> votes = voteRepository.findByCompanyId(user.getCompany().getId());
        return ResponseEntity.ok(votes);
    }
}
