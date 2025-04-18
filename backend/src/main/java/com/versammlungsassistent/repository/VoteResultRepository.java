package com.versammlungsassistent.repository;

import com.versammlungsassistent.model.VoteResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteResultRepository extends JpaRepository<VoteResult, Long> {
}

