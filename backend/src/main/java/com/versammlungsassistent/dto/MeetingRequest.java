package com.versammlungsassistent.dto;

import java.util.List;

public class MeetingRequest {
    private String title;
    private String dateTime;
    private String meetingType;
    private String locationOrLink;
    private List<String> participants; // E-Mail-Adressen
    private List<String> agendaItems;

    // Getter/Setter
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDateTime() { return dateTime; }
    public void setDateTime(String dateTime) { this.dateTime = dateTime; }

    public String getMeetingType() { return meetingType; }
    public void setMeetingType(String meetingType) { this.meetingType = meetingType; }

    public String getLocationOrLink() { return locationOrLink; }
    public void setLocationOrLink(String locationOrLink) { this.locationOrLink = locationOrLink; }

    public List<String> getParticipants() { return participants; }
    public void setParticipants(List<String> participants) { this.participants = participants; }

    public List<String> getAgendaItems() { return agendaItems; }
    public void setAgendaItems(List<String> agendaItems) { this.agendaItems = agendaItems; }
}
