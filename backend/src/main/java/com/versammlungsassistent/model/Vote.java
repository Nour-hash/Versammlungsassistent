package com.versammlungsassistent.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "votes")
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topic;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @JsonBackReference // Verhindert zirkuläre Referenz beim Serialisieren
    private Company company;

    @ElementCollection
    @CollectionTable(name = "vote_results", joinColumns = @JoinColumn(name = "vote_id"))
    @Column(name = "result")
    private List<String> results; // List of votes (e.g., "yes", "no")

    // Getter und Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public List<String> getResults() {
        return results;
    }

    public void setResults(List<String> results) {
        this.results = results;
    }
}
