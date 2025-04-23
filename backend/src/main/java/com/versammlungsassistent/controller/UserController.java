package com.versammlungsassistent.controller;

import com.versammlungsassistent.dto.ShareholderDTO;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.service.UserService;
import com.versammlungsassistent.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/shareholders")
    public ResponseEntity<List<ShareholderDTO>> getShareholders(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"2".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<User> shareholders = userService.getShareholdersByCompany(user.getCompany().getName());
        List<ShareholderDTO> dtos = shareholders.stream()
                .map(u -> new ShareholderDTO(u.getEmail(), u.getEmail())) // oder u.getName()
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
