package com.versammlungsassistent.dto;

import java.time.LocalDateTime;

public class MeetingResultsRequest {
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

    private String resultsText;
    private LocalDateTime resultsSentAt;
}
