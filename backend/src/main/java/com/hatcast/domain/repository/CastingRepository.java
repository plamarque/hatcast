package com.hatcast.domain.repository;

import com.hatcast.domain.model.Casting;
import java.util.List;
import java.util.Optional;

public interface CastingRepository {
    Optional<Casting> findById(String id);
    Optional<Casting> findByShowId(String showId);
    List<Casting> findAll();
    List<Casting> findByStatus(Casting.CastingStatus status);
    Casting save(Casting casting);
    void deleteById(String id);
    boolean existsById(String id);
    boolean existsByShowId(String showId);
}