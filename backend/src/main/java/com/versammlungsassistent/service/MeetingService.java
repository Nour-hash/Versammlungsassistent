package com.versammlungsassistent.service;

import com.versammlungsassistent.dto.MeetingRequest;
import com.versammlungsassistent.model.Company;
import com.versammlungsassistent.model.Meeting;
import com.versammlungsassistent.model.User;
import com.versammlungsassistent.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    public Meeting findById(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting nicht gefunden"));
    }

    public Meeting save(Meeting meeting) {
        return meetingRepository.save(meeting);
    }

    public List<Meeting> findLatestMeetingsByCompany(Long companyId) {
        return meetingRepository.findTop5ByCompanyIdOrderByDateTimeDesc(companyId);
    }

    public boolean existsMeetingInCurrentYear(Long companyId) {
        LocalDateTime start = LocalDateTime.of(LocalDate.now().getYear(), 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(LocalDate.now().getYear(), 12, 31, 23, 59);
        return meetingRepository.existsByCompanyIdAndDateTimeBetween(companyId, start, end);
    }

    public List<Meeting> findMeetingsByCompany(Company company) {
        return meetingRepository.findByCompany(company);
    }

}
