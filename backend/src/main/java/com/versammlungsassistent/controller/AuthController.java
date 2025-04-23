package com.versammlungsassistent.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import com.versammlungsassistent.util.JwtUtil;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserService userService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        if (request.getCompanyName() == null || request.getCompanyName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Company name cannot be null or empty");
        }

        // Validate role (1 = Gesellschafter, 2 = Geschäftsführer)
        if (request.getRole() != 1 && request.getRole() != 2) {
            return ResponseEntity.badRequest().body("Invalid role. Role must be 1 (Gesellschafter) or 2 (Geschäftsführer)");
        }

        userService.saveUser(request.getEmail(), request.getPassword(), String.valueOf(request.getRole()), request.getCompanyName(), request.getShares());
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/registerGesellschafter")
    public ResponseEntity<String> registerGesellschafter(
            @RequestBody GesellschafterRequest request,
            @RequestHeader("Authorization") String token) {
        // Entferne den "Bearer " Präfix
        String jwtToken = token.substring(7);
        String email = jwtUtil.extractUsername(jwtToken);
        User geschaeftsfuehrer = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Geschäftsführer nicht gefunden"));

        // Prüfe, ob der angemeldete User tatsächlich Geschäftsführer ist (Rolle "2")
        if (!"2".equals(geschaeftsfuehrer.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Nicht berechtigt!");
        }

        try {
            // Die company des Geschäftsführers wird übernommen.
            // Die Rolle wird hartcodiert auf "1" (Gesellschafter) gesetzt.
            userService.saveUser(
                    request.getEmail(),
                    request.getPassword(),
                    "1",
                    geschaeftsfuehrer.getCompany().getName(), // Company des Geschäftsführers
                    request.getShares()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        return ResponseEntity.ok("Gesellschafter erfolgreich registriert");
    }


    @PostMapping("/create-invitation")
    public ResponseEntity<String> createInvitation(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!"2".equals(user.getRole())) { // Check if the user is a Geschäftsführer
            return ResponseEntity.status(403).body("Access denied: Only Geschäftsführer can create invitations");
        }

        // Logic for creating an invitation (e.g., saving to the database) goes here
        return ResponseEntity.ok("Invitation created successfully");
    }

    @PostMapping("/login")
public String login(@RequestBody LoginRequest request) {
    System.out.println("Login request received for email: " + request.getEmail());
    try {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String email = authentication.getName();

        // 🔍 Hol dir den User (damit du userId und companyId bekommst)
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole();
        Long userId = user.getId();
        Long companyId = user.getCompany().getId();
        System.err.println("neuer user mit User ID: " + userId + ", Company ID: " + companyId);

        // ✅ JWT jetzt mit userId und companyId erstellen
        String jwt = jwtUtil.generateToken(email, role, userId, companyId);
        

        System.out.println("Authentication successful for user: " + email + " with role: " + role);
        System.out.println("Generated JWT: " + jwt);
        return "JWT Token: " + jwt;

    } catch (AuthenticationException e) {
        System.err.println("Authentication failed: " + e.getMessage());
        return "Authentication failed: " + e.getMessage();
    }
}


    // DTO für den Request an den neuen Endpunkt
    public static class GesellschafterRequest {
        private String email;
        private String password;
        private Integer shares; // Anzahl Stimmen

        // Getter und Setter
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public Integer getShares() {
            return shares;
        }

        public void setShares(Integer shares) {
            this.shares = shares;
        }
    }

    // DTO for register request
    public static class RegisterRequest {
        private String email;
        private String password;
        private int role; // Role as an integer (1 or 2)
        private String companyName; // Company name
        private Integer shares; // Shares for Gesellschafter

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public int getRole() {
            return role;
        }

        public void setRole(int role) {
            this.role = role;
        }

        public String getCompanyName() {
            return companyName;
        }

        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }

        public Integer getShares() {
            return shares;
        }

        public void setShares(Integer shares) {
            this.shares = shares;
        }
    }

    // DTO for login request
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

}
