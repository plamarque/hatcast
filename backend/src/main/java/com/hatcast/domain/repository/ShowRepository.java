package com.hatcast.domain.repository;

import com.hatcast.domain.model.Show;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShowRepository {
    Optional<Show> findById(String id);
    List<Show> findAll();
    List<Show> findBySeasonId(String seasonId);
    List<Show> findActive();
    List<Show> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<Show> findByStatus(Show.ShowStatus status);
    Show save(Show show);
    void deleteById(String id);
    boolean existsById(String id);
}