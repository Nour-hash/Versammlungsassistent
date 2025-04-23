package com.versammlungsassistent.service;

import com.versammlungsassistent.dto.MeetingRequest;
import com.versammlungsassistent.model.Company;
import com.versammlungsassistent.model.Meeting;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public Meeting saveMeeting(MeetingRequest request, User initiator) {
        Meeting m = new Meeting();
        m.setTitle(request.getTitle());
        m.setDateTime(LocalDateTime.parse(request.getDateTime()));
        m.setMeetingType(request.getMeetingType());
        m.setLocationOrLink(request.getLocationOrLink());
        m.setParticipants(request.getParticipants());
        m.setAgendaItems(request.getAgendaItems());
        m.setCompany(initiator.getCompany());

        return meetingRepository.save(m);
    }
}
