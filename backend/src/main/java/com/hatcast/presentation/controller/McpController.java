package com.hatcast.presentation.controller;

import com.hatcast.application.service.SeasonService;
import com.hatcast.application.service.ShowService;
import com.hatcast.application.service.CastingService;
import com.hatcast.domain.model.Season;
import com.hatcast.domain.model.Show;
import com.hatcast.domain.model.Casting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mcp")
public class McpController {
    
    private final SeasonService seasonService;
    private final ShowService showService;
    private final CastingService castingService;
    
    @Autowired
    public McpController(SeasonService seasonService, ShowService showService, CastingService castingService) {
        this.seasonService = seasonService;
        this.showService = showService;
        this.castingService = castingService;
    }
    
    @GetMapping("/seasons")
    public ResponseEntity<Map<String, Object>> getSeasons() {
        try {
            List<Season> seasons = seasonService.findActive();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", seasons);
            response.put("count", seasons.size());
            response.put("description", "Liste des saisons théâtrales actives");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @GetMapping("/shows")
    public ResponseEntity<Map<String, Object>> getShows(
            @RequestParam(required = false) String seasonId,
            @RequestParam(required = false) String status) {
        try {
            Map<String, Object> filters = new HashMap<>();
            if (seasonId != null) filters.put("seasonId", seasonId);
            if (status != null) filters.put("status", status);
            
            List<Show> shows = showService.findActive();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", shows);
            response.put("count", shows.size());
            response.put("filters", filters);
            response.put("description", "Liste des spectacles avec filtres appliqués");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            List<Season> seasons = seasonService.findActive();
            List<Show> shows = showService.findActive();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalSeasons", seasons.size());
            stats.put("totalShows", shows.size());
            stats.put("activeSeasons", seasons.stream().filter(Season::isActive).count());
            stats.put("activeShows", shows.stream().filter(Show::isActive).count());
            
            // Statistiques par statut de spectacle
            Map<String, Long> showsByStatus = shows.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    show -> show.getStatus().toString(),
                    java.util.stream.Collectors.counting()
                ));
            stats.put("showsByStatus", showsByStatus);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            response.put("description", "Statistiques agrégées de HatCast");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> naturalLanguageQuery(@RequestBody Map<String, String> request) {
        try {
            String query = request.get("query");
            if (query == null || query.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Query parameter is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Analyse simple de la requête en langage naturel
            String lowerQuery = query.toLowerCase();
            Map<String, Object> result = new HashMap<>();
            
            if (lowerQuery.contains("saison") || lowerQuery.contains("season")) {
                List<Season> seasons = seasonService.findActive();
                result.put("type", "seasons");
                result.put("data", seasons);
                result.put("count", seasons.size());
            } else if (lowerQuery.contains("spectacle") || lowerQuery.contains("show")) {
                List<Show> shows = showService.findActive();
                result.put("type", "shows");
                result.put("data", shows);
                result.put("count", shows.size());
            } else if (lowerQuery.contains("statistique") || lowerQuery.contains("stat")) {
                // Reutiliser la logique de getStats()
                List<Season> seasons = seasonService.findActive();
                List<Show> shows = showService.findActive();
                
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalSeasons", seasons.size());
                stats.put("totalShows", shows.size());
                stats.put("activeSeasons", seasons.stream().filter(Season::isActive).count());
                stats.put("activeShows", shows.stream().filter(Show::isActive).count());
                
                result.put("type", "stats");
                result.put("data", stats);
            } else {
                result.put("type", "unknown");
                result.put("message", "Je ne comprends pas cette requête. Essayez avec 'saisons', 'spectacles' ou 'statistiques'.");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("result", result);
            response.put("description", "Résultat de la requête en langage naturel");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}