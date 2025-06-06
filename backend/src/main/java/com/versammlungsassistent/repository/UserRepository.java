package com.versammlungsassistent.repository;

import com.versammlungsassistent.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByCompany_NameAndRole(String companyName, String role);
    List<User> findByCompanyId(Long companyId);

}
