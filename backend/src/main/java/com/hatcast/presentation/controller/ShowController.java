package com.hatcast.presentation.controller;

import com.hatcast.application.service.ShowService;
import com.hatcast.domain.model.Show;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shows")
public class ShowController {
    
    private final ShowService showService;
    
    @Autowired
    public ShowController(ShowService showService) {
        this.showService = showService;
    }
    
    @GetMapping
    public ResponseEntity<List<Show>> getAllShows(
            @RequestParam(required = false) String seasonId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean active) {
        
        List<Show> shows;
        
        if (seasonId != null) {
            shows = showService.findBySeasonId(seasonId);
        } else if (status != null) {
            try {
                Show.ShowStatus showStatus = Show.ShowStatus.valueOf(status.toUpperCase());
                shows = showService.findByStatus(showStatus);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (active != null && active) {
            shows = showService.findActive();
        } else {
            shows = showService.findAll();
        }
        
        return ResponseEntity.ok(shows);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Show> getShow(@PathVariable String id) {
        Optional<Show> show = showService.findById(id);
        return show.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Show> createShow(@RequestBody Show show, Authentication authentication) {
        try {
            Show createdShow = showService.createShow(show);
            return ResponseEntity.ok(createdShow);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Show> updateShow(@PathVariable String id, @RequestBody Show show) {
        try {
            Show updatedShow = showService.updateShow(id, show);
            return ResponseEntity.ok(updatedShow);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShow(@PathVariable String id) {
        try {
            showService.deleteShow(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}