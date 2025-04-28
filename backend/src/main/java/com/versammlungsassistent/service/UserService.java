package com.versammlungsassistent.service;

import com.versammlungsassistent.model.Company;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.repository.CompanyRepository;
import com.versammlungsassistent.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompanyRepository companyRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.companyRepository = companyRepository;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getShareholdersByCompany(String companyName) {
        return userRepository.findByCompany_NameAndRole(companyName, "1"); // 1 = Gesellschafter
    }

    public User saveUser(String email, String rawPassword, String role, String companyName, Integer stimmen, Double kapital) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be null or empty");
        }

        Company company = companyRepository.findByName(companyName)
                .orElseGet(() -> {
                    Company newCompany = new Company();
                    newCompany.setName(companyName);
                    return companyRepository.save(newCompany);
                });

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setCompany(company);

        if ("1".equals(role)) { // If the user is a Gesellschafter
            user.setStimmen(stimmen);
            user.setKapital(kapital);
            // Add kapital to company's stammkapital
            if (kapital != null && kapital > 0) {
                Double currentStammkapital = company.getStammkapital() != null ? company.getStammkapital() : 0.0;
                company.setStammkapital(currentStammkapital + kapital);
                companyRepository.save(company);
            }
        }

        return userRepository.save(user);
    }
}
