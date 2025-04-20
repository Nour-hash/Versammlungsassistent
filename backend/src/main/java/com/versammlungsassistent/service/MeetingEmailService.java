package com.versammlungsassistent.service;

import com.versammlungsassistent.model.Meeting;
import org.springframework.stereotype.Service;

@Service
public class MeetingEmailService {

    private final MailjetEmailService mailjet;

    public MeetingEmailService(MailjetEmailService mailjet) {
        this.mailjet = mailjet;
    }

    public void sendInvitations(Meeting meeting) {
        for (String email : meeting.getParticipants()) {
            String body = createMessage(meeting);
            mailjet.sendEmail(email, "Einladung: " + meeting.getTitle(), body);
        }
    }

    private String createMessage(Meeting meeting) {
        return "Sehr geehrte Gesellschafterin, sehr geehrter Gesellschafter,\n\n" +
                "Hiermit laden wir Sie zur Versammlung \"" + meeting.getTitle() + "\" ein.\n\n" +
                "📅 Datum & Uhrzeit: " + meeting.getDateTime() + "\n" +
                "🧑‍💻 Typ: " + meeting.getMeetingType() + "\n" +
                "📍 Ort / Link: " + meeting.getLocationOrLink() + "\n\n" +
                "Tagesordnung:\n - " + String.join("\n - ", meeting.getAgendaItems()) + "\n\n" +
                "Mit freundlichen Grüßen,\nDie Geschäftsführung";
    }
}
