package com.versammlungsassistent.model;

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
    private Company company;

    @ElementCollection
    @CollectionTable(name = "vote_results", joinColumns = @JoinColumn(name = "vote_id"))
    @Column(name = "result")
    private List<String> results; // List of votes (e.g., "yes", "no")

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
