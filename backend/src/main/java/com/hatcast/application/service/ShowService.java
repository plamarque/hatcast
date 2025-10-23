package com.hatcast.application.service;

import com.hatcast.domain.model.Show;
import com.hatcast.domain.repository.ShowRepository;
import com.hatcast.domain.repository.SeasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShowService {
    
    private final ShowRepository showRepository;
    private final SeasonRepository seasonRepository;
    
    @Autowired
    public ShowService(ShowRepository showRepository, SeasonRepository seasonRepository) {
        this.showRepository = showRepository;
        this.seasonRepository = seasonRepository;
    }
    
    public Optional<Show> findById(String id) {
        return showRepository.findById(id);
    }
    
    public List<Show> findAll() {
        return showRepository.findAll();
    }
    
    public List<Show> findBySeasonId(String seasonId) {
        return showRepository.findBySeasonId(seasonId);
    }
    
    public List<Show> findActive() {
        return showRepository.findActive();
    }
    
    public List<Show> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return showRepository.findByDateRange(startDate, endDate);
    }
    
    public List<Show> findByStatus(Show.ShowStatus status) {
        return showRepository.findByStatus(status);
    }
    
    public Show createShow(Show show) {
        // Validation métier
        if (show.getMinActors() > show.getMaxActors()) {
            throw new IllegalArgumentException("Min actors cannot be greater than max actors");
        }
        
        if (show.getShowDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Show date cannot be in the past");
        }
        
        // Vérifier que la saison existe
        if (!seasonRepository.existsById(show.getSeasonId())) {
            throw new IllegalArgumentException("Season with id " + show.getSeasonId() + " not found");
        }
        
        return showRepository.save(show);
    }
    
    public Show updateShow(String id, Show show) {
        if (!showRepository.existsById(id)) {
            throw new IllegalArgumentException("Show with id " + id + " not found");
        }
        
        // Validation métier
        if (show.getMinActors() > show.getMaxActors()) {
            throw new IllegalArgumentException("Min actors cannot be greater than max actors");
        }
        
        show.setId(id);
        return showRepository.save(show);
    }
    
    public void deleteShow(String id) {
        if (!showRepository.existsById(id)) {
            throw new IllegalArgumentException("Show with id " + id + " not found");
        }
        
        showRepository.deleteById(id);
    }
    
    public boolean showExists(String id) {
        return showRepository.existsById(id);
    }
}