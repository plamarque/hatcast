package com.hatcast.domain.repository;

import com.hatcast.domain.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    List<User> findByRole(User.UserRole role);
    User save(User user);
    void deleteById(String id);
    boolean existsById(String id);
    boolean existsByEmail(String email);
}