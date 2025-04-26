package com.versammlungsassistent.repository;

import com.versammlungsassistent.model.Company;
import com.versammlungsassistent.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findTop5ByCompanyIdOrderByDateTimeDesc(Long companyId);

    boolean existsByCompanyIdAndDateTimeBetween(Long companyId, LocalDateTime start, LocalDateTime end);

    List<Meeting> findByCompany(Company company);

}
