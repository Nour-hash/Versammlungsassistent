package com.versammlungsassistent.repository;

import com.versammlungsassistent.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    

    java.util.Optional<Vote> findById(Long id);

    List<Vote> findByCompanyId(Long companyId);

    @Query("SELECT v FROM Vote v WHERE v.company.id = :companyId AND NOT EXISTS (" +
    "SELECT vr FROM VoteResult vr WHERE vr.vote = v AND vr.userId = :userId)")
List<Vote> findVotesNotYetVotedByUserAndCompany(@Param("userId") Long userId, @Param("companyId") Long companyId);


}
