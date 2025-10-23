package com.hatcast.domain.repository;

import com.hatcast.domain.model.Availability;
import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository {
    Optional<Availability> findById(String id);
    Optional<Availability> findByUserIdAndShowId(String userId, String showId);
    List<Availability> findByUserId(String userId);
    List<Availability> findByShowId(String showId);
    List<Availability> findAvailableByShowId(String showId);
    Availability save(Availability availability);
    void deleteById(String id);
    void deleteByUserIdAndShowId(String userId, String showId);
    boolean existsById(String id);
    boolean existsByUserIdAndShowId(String userId, String showId);
}