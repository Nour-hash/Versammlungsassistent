package com.versammlungsassistent.controller;

import com.versammlungsassistent.model.User;
import com.versammlungsassistent.model.Vote;
import com.versammlungsassistent.model.VoteResult;
import com.versammlungsassistent.repository.UserRepository;
import com.versammlungsassistent.repository.VoteRepository;
import com.versammlungsassistent.service.UserService;
import com.versammlungsassistent.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteRepository voteRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public VoteController(VoteRepository voteRepository, UserService userService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.voteRepository = voteRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
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

    result = result.toLowerCase().replace("\"", "").replace("\r", "").replace("\n", "");
    if (!result.equals("ja") && !result.equals("nein") && !result.equals("enthalten")) {
        return ResponseEntity.badRequest().body("Invalid vote result. Must be 'ja', 'nein' or 'enthalten'");
    }

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
public ResponseEntity<Map<String, Object>> getVoteResultsSummary(@PathVariable Long voteId, @RequestParam(value = "type", required = false, defaultValue = "einfach") String beschlussType) {
    Vote vote = voteRepository.findById(voteId).orElseThrow(() -> new RuntimeException("Vote not found"));

    // Map: Antwort -> {stimmen, kapital}
    Map<String, Integer> stimmenMap = new HashMap<>();
    Map<String, Double> kapitalMap = new HashMap<>();
    stimmenMap.put("ja", 0); stimmenMap.put("nein", 0); stimmenMap.put("enthalten", 0);
    kapitalMap.put("ja", 0.0); kapitalMap.put("nein", 0.0); kapitalMap.put("enthalten", 0.0);

    int gesamtStimmen = 0;
    double gesamtKapital = 0.0;

    for (VoteResult result : vote.getResults()) {
        String antwort = result.getResult().toLowerCase();
        stimmenMap.put(antwort, stimmenMap.get(antwort) + 1);
        User user = userRepository.findById(result.getUserId()).orElse(null);
        double anteil = (user != null && user.getKapital() != null) ? user.getKapital() : 0.0;
        kapitalMap.put(antwort, kapitalMap.get(antwort) + anteil);
        gesamtStimmen++;
        gesamtKapital += anteil;
    }

    // Neue Regel: 10% des Stammkapitals müssen anwesend sein
    double stammkapital = vote.getCompany().getStammkapital() != null ? vote.getCompany().getStammkapital() : 0.0;
    double requiredKapital = 0.1 * stammkapital;
    double kapitalAnwesend = kapitalMap.get("ja") + kapitalMap.get("nein") + kapitalMap.get("enthalten");
    // Fix: Do NOT divide kapitalAnwesend by stammkapital here
    boolean angenommen = false;
    String regelText = "";
    int jaStimmen = stimmenMap.get("ja");
    if (gesamtStimmen == 0) {
        regelText = "Keine Stimmen abgegeben.";
    } else if ("einfach".equalsIgnoreCase(beschlussType)) {
        angenommen = (kapitalAnwesend >= requiredKapital) && (jaStimmen > gesamtStimmen / 2.0);
        regelText = String.format("Einfacher Beschluss: Mind. 10%% des Stammkapitals (%.2f von %.2f) anwesend und >50%% Ja-Stimmen.", requiredKapital, stammkapital);
    } else if ("vertragsaenderung".equalsIgnoreCase(beschlussType)) {
        angenommen = (kapitalAnwesend >= requiredKapital) && (jaStimmen > gesamtStimmen * 0.75);
        regelText = String.format("Vertragsänderung: Mind. 10%% des Stammkapitals (%.2f von %.2f) anwesend und >75%% Ja-Stimmen.", requiredKapital, stammkapital);
    }

    Map<String, Object> response = new HashMap<>();
    response.put("stimmen", stimmenMap);
    response.put("kapital", kapitalMap);
    response.put("gesamtStimmen", gesamtStimmen);
    response.put("gesamtKapital", gesamtKapital);
    response.put("kapitalAnwesend", kapitalAnwesend);
    response.put("angenommen", angenommen);
    response.put("regelText", regelText);
    return ResponseEntity.ok(response);
}
    
}
