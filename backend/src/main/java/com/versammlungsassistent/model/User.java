package com.versammlungsassistent.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @JsonBackReference
    private Company company;

    @Column(nullable = true) // Nullable because only "Gesellschafter" have stimmen/kapital
    private Integer stimmen;

    @Column(nullable = true) // Nullable because only "Gesellschafter" have kapital
    private Double kapital;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Integer getStimmen() {
        return stimmen;
    }

    public void setStimmen(Integer stimmen) {
        this.stimmen = stimmen;
    }

    public Double getKapital() {
        return kapital;
    }

    public void setKapital(Double kapital) {
        this.kapital = kapital;
    }
}
