package com.versammlungsassistent.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meeting")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "DATETIME")
    private LocalDateTime dateTime;

    private String meetingType;


    public String getResultsText() {
        return resultsText;
    }

    public void setResultsText(String resultsText) {
        this.resultsText = resultsText;
    }

    public LocalDateTime getResultsSentAt() {
        return resultsSentAt;
    }

    public void setResultsSentAt(LocalDateTime resultsSentAt) {
        this.resultsSentAt = resultsSentAt;
    }

    private String locationOrLink;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String resultsText;

    @ElementCollection
    private List<String> challenges = new ArrayList<>();

    @Column(columnDefinition = "DATETIME")
    private LocalDateTime resultsSentAt;

    @ElementCollection
    private List<String> participants; // E-Mail-Liste

    @ElementCollection
    private List<String> agendaItems;

    @ManyToOne
    private Company company;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getMeetingType() {
        return meetingType;
    }

    public void setMeetingType(String meetingType) {
        this.meetingType = meetingType;
    }

    public String getLocationOrLink() {
        return locationOrLink;
    }

    public void setLocationOrLink(String locationOrLink) {
        this.locationOrLink = locationOrLink;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public List<String> getAgendaItems() {
        return agendaItems;
    }

    public void setAgendaItems(List<String> agendaItems) {
        this.agendaItems = agendaItems;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public List<String> getChallenges() {
        return challenges;
    }

    public void setChallenges(List<String> challenges) {
        this.challenges = challenges;
    }
}
