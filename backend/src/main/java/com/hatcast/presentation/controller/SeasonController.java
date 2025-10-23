package com.hatcast.presentation.controller;

import com.hatcast.application.service.SeasonService;
import com.hatcast.domain.model.Season;
import com.hatcast.infrastructure.security.FirebaseAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/seasons")
public class SeasonController {
    
    private final SeasonService seasonService;
    
    @Autowired
    public SeasonController(SeasonService seasonService) {
        this.seasonService = seasonService;
    }
    
    @GetMapping
    public ResponseEntity<List<Season>> getAllSeasons(
            @RequestParam(required = false) Boolean active) {
        
        List<Season> seasons;
        if (active != null && active) {
            seasons = seasonService.findActive();
        } else {
            seasons = seasonService.findAll();
        }
        
        return ResponseEntity.ok(seasons);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Season> getSeason(@PathVariable String id) {
        Optional<Season> season = seasonService.findById(id);
        return season.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Season> createSeason(@RequestBody Season season, Authentication authentication) {
        try {
            Season createdSeason = seasonService.createSeason(season);
            return ResponseEntity.ok(createdSeason);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Season> updateSeason(@PathVariable String id, @RequestBody Season season) {
        try {
            Season updatedSeason = seasonService.updateSeason(id, season);
            return ResponseEntity.ok(updatedSeason);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSeason(@PathVariable String id) {
        try {
            seasonService.deleteSeason(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}