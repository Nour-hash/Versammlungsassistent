package com.versammlungsassistent.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    // Simulated user database
    private final Map<String, String> users = new HashMap<>();

    public CustomUserDetailsService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;

        // Add a test user (username: admin, password: admin)
        users.put("admin", passwordEncoder.encode("admin"));
        users.put("user1", passwordEncoder.encode("password1")); // Add user1 with password1
        users.put("user2", passwordEncoder.encode("password2")); // Add user2 with password2
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (!users.containsKey(username)) {
            throw new UsernameNotFoundException("User not found");
        }

        return User.builder()
            .username(username)
            .password(users.get(username))
            .roles("USER") // Assign a default role
            .build();
    }
}
