package com.versammlungsassistent.controller;

import com.versammlungsassistent.model.User;
import com.versammlungsassistent.model.Vote;
import com.versammlungsassistent.model.VoteResult;
import com.versammlungsassistent.repository.VoteRepository;
import com.versammlungsassistent.service.UserService;
import com.versammlungsassistent.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
public ResponseEntity<String> createVote(@RequestHeader("Authorization") String token,
                                         @RequestBody Vote vote) {
    String email = jwtUtil.extractUsername(token.substring(7));
    User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (!"2".equals(user.getRole())) {
        return ResponseEntity.status(403).body("Access denied: Only Geschäftsführer can create votes");
    }

    if (vote.getEndTime().isBefore(vote.getStartTime())) {
        return ResponseEntity.badRequest().body("End time cannot be before start time");
    }

    vote.setCompany(user.getCompany()); // Sicherheit: company nicht aus dem Body nehmen
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

    VoteResult voteResult = new VoteResult();
    voteResult.setResult(result);
    voteResult.setUserId(user.getId());
    voteResult.setVote(vote);

    vote.getResults().add(voteResult);
    voteRepository.save(vote);

    return ResponseEntity.ok("Vote submitted successfully");
}

    @GetMapping("/company")
    public ResponseEntity<List<Vote>> getVotesForCompany(@RequestHeader("Authorization") String token) {
        System.out.println("TOKEN: [" + token + "]");
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<Vote> votes = voteRepository.findByCompanyId(user.getCompany().getId());
        return ResponseEntity.ok(votes);
    }


    @GetMapping("/available")
    public List<Vote> getVotesNotYetVotedByUser(@RequestHeader("Authorization") String token) {
        System.out.println("TOKEN: [" + token + "]");
        if (token.startsWith("Bearer ")) {
            token = token.substring(7); // 🔪 entferne "Bearer "
            System.out.println("needs trimming");
        }
        Long userId = jwtUtil.extractUserId(token); // oder getUser().getId()
    Long companyId = jwtUtil.extractCompanyId(token); // falls Company im User geladen ist

    return voteRepository.findVotesNotYetVotedByUserAndCompany(userId, companyId);
}

@GetMapping("/{voteId}/results")
public ResponseEntity<Map<String, Long>> getVoteResultsSummary(@PathVariable Long voteId) {
    Vote vote = voteRepository.findById(voteId).orElseThrow(() -> new RuntimeException("Vote not found"));

    Map<String, Long> resultSummary = vote.getResults().stream()
            .collect(Collectors.groupingBy(
                r -> r.getResult().toLowerCase(),
                Collectors.counting()
            ));

            /* 
    // Sicherstellen, dass alle drei Kategorien da sind, auch wenn leer
    resultSummary.putIfAbsent("ja", 0L);
    resultSummary.putIfAbsent("nein", 0L);
    resultSummary.putIfAbsent("enthalten", 0L);
    */

    return ResponseEntity.ok(resultSummary);
}
    
}
