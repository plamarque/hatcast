package com.hatcast.domain.repository;

import com.hatcast.domain.model.Season;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SeasonRepository {
    Optional<Season> findById(String id);
    List<Season> findAll();
    List<Season> findActive();
    List<Season> findByDateRange(LocalDate startDate, LocalDate endDate);
    Season save(Season season);
    void deleteById(String id);
    boolean existsById(String id);
}