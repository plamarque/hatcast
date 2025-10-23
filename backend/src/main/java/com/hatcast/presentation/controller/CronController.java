package com.hatcast.presentation.controller;

import com.hatcast.application.service.EmailService;
import com.hatcast.application.service.CastingService;
import com.hatcast.application.service.ShowService;
import com.hatcast.application.service.UserService;
import com.hatcast.domain.model.User;
import com.hatcast.domain.model.Show;
import com.hatcast.domain.model.Casting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cron")
public class CronController {
    
    private final EmailService emailService;
    private final CastingService castingService;
    private final ShowService showService;
    private final UserService userService;
    
    @Autowired
    public CronController(EmailService emailService, CastingService castingService, 
                         ShowService showService, UserService userService) {
        this.emailService = emailService;
        this.castingService = castingService;
        this.showService = showService;
        this.userService = userService;
    }
    
    @PostMapping("/daily-reminder")
    public ResponseEntity<Map<String, Object>> dailyReminder(@RequestHeader("Authorization") String authHeader) {
        try {
            // Vérifier l'authentification Cloud Scheduler
            if (!isValidCloudSchedulerRequest(authHeader)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            // Récupérer tous les utilisateurs actifs
            List<User> users = userService.findAll();
            int emailsSent = 0;
            
            for (User user : users) {
                if (user.isActive() && user.getPreferences() != null && user.getPreferences().isEmailNotifications()) {
                    try {
                        // Envoyer un rappel quotidien
                        Map<String, Object> templateData = new HashMap<>();
                        templateData.put("user_name", user.getDisplayName());
                        templateData.put("current_date", LocalDateTime.now().toString());
                        
                        emailService.sendCastingReminder(user.getEmail(), user.getDisplayName(), templateData);
                        emailsSent++;
                        
                    } catch (Exception e) {
                        System.err.println("Failed to send daily reminder to " + user.getEmail() + ": " + e.getMessage());
                    }
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("emails_sent", emailsSent);
            response.put("total_users", users.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/auto-draw")
    public ResponseEntity<Map<String, Object>> autoDraw(@RequestHeader("Authorization") String authHeader) {
        try {
            // Vérifier l'authentification Cloud Scheduler
            if (!isValidCloudSchedulerRequest(authHeader)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            // Récupérer tous les spectacles en cours de casting
            List<Show> shows = showService.findByStatus(Show.ShowStatus.CASTING_OPEN);
            int castingsProcessed = 0;
            
            for (Show show : shows) {
                try {
                    // Effectuer le tirage automatique
                    Casting casting = castingService.performAutomaticDraw(show.getId());
                    if (casting != null) {
                        castingsProcessed++;
                    }
                } catch (Exception e) {
                    System.err.println("Failed to process auto draw for show " + show.getId() + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("castings_processed", castingsProcessed);
            response.put("total_shows", shows.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/monthly-cleanup")
    public ResponseEntity<Map<String, Object>> monthlyCleanup(@RequestHeader("Authorization") String authHeader) {
        try {
            // Vérifier l'authentification Cloud Scheduler
            if (!isValidCloudSchedulerRequest(authHeader)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            // Nettoyage des données anciennes
            LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(6);
            
            // Supprimer les spectacles anciens et inactifs
            List<Show> oldShows = showService.findByDateRange(
                LocalDateTime.now().minusYears(2), 
                cutoffDate
            );
            
            int cleanedShows = 0;
            for (Show show : oldShows) {
                if (!show.isActive()) {
                    showService.deleteShow(show.getId());
                    cleanedShows++;
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cleaned_shows", cleanedShows);
            response.put("cutoff_date", cutoffDate);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    private boolean isValidCloudSchedulerRequest(String authHeader) {
        // Vérification basique de l'en-tête d'autorisation
        // En production, il faudrait vérifier le token JWT de Cloud Scheduler
        return authHeader != null && authHeader.startsWith("Bearer ");
    }
}