package com.techquest.lablink.repository;

import com.techquest.lablink.enums.Role;
import com.techquest.lablink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    Optional<User> findByEmailVerificationToken(String token);
}
