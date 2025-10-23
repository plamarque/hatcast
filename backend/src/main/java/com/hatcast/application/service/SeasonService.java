package com.hatcast.application.service;

import com.hatcast.domain.model.Season;
import com.hatcast.domain.repository.SeasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SeasonService {
    
    private final SeasonRepository seasonRepository;
    
    @Autowired
    public SeasonService(SeasonRepository seasonRepository) {
        this.seasonRepository = seasonRepository;
    }
    
    public Optional<Season> findById(String id) {
        return seasonRepository.findById(id);
    }
    
    public List<Season> findAll() {
        return seasonRepository.findAll();
    }
    
    public List<Season> findActive() {
        return seasonRepository.findActive();
    }
    
    public List<Season> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return seasonRepository.findByDateRange(startDate, endDate);
    }
    
    public Season createSeason(Season season) {
        // Validation métier
        if (season.getStartDate().isAfter(season.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        
        // Vérifier qu'il n'y a pas de chevauchement avec d'autres saisons
        List<Season> overlappingSeasons = seasonRepository.findByDateRange(
            season.getStartDate(), season.getEndDate());
        
        if (!overlappingSeasons.isEmpty()) {
            throw new IllegalArgumentException("Season overlaps with existing season: " + 
                overlappingSeasons.get(0).getName());
        }
        
        return seasonRepository.save(season);
    }
    
    public Season updateSeason(String id, Season season) {
        if (!seasonRepository.existsById(id)) {
            throw new IllegalArgumentException("Season with id " + id + " not found");
        }
        
        // Validation métier
        if (season.getStartDate().isAfter(season.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        
        season.setId(id);
        return seasonRepository.save(season);
    }
    
    public void deleteSeason(String id) {
        if (!seasonRepository.existsById(id)) {
            throw new IllegalArgumentException("Season with id " + id + " not found");
        }
        
        seasonRepository.deleteById(id);
    }
    
    public boolean seasonExists(String id) {
        return seasonRepository.existsById(id);
    }
}