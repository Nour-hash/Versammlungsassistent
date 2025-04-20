package com.versammlungsassistent.repository;

import com.versammlungsassistent.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
}
