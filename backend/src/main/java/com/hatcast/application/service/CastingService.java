package com.hatcast.application.service;

import com.hatcast.domain.model.Casting;
import com.hatcast.domain.model.Show;
import com.hatcast.domain.model.Availability;
import com.hatcast.domain.repository.CastingRepository;
import com.hatcast.domain.repository.ShowRepository;
import com.hatcast.domain.repository.AvailabilityRepository;
import com.hatcast.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CastingService {
    
    private final CastingRepository castingRepository;
    private final ShowRepository showRepository;
    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public CastingService(CastingRepository castingRepository, ShowRepository showRepository,
                         AvailabilityRepository availabilityRepository, UserRepository userRepository) {
        this.castingRepository = castingRepository;
        this.showRepository = showRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
    }
    
    public Optional<Casting> findByShowId(String showId) {
        return castingRepository.findByShowId(showId);
    }
    
    public Casting createCasting(String showId, LocalDateTime castingDate) {
        // Vérifier que le spectacle existe
        if (!showRepository.existsById(showId)) {
            throw new IllegalArgumentException("Show with id " + showId + " not found");
        }
        
        // Vérifier qu'il n'y a pas déjà un casting pour ce spectacle
        if (castingRepository.existsByShowId(showId)) {
            throw new IllegalArgumentException("Casting already exists for show " + showId);
        }
        
        Casting casting = new Casting(showId, castingDate);
        return castingRepository.save(casting);
    }
    
    public Casting performAutomaticDraw(String showId) {
        Optional<Casting> castingOpt = castingRepository.findByShowId(showId);
        if (castingOpt.isEmpty()) {
            throw new IllegalArgumentException("Casting not found for show " + showId);
        }
        
        Casting casting = castingOpt.get();
        
        // Récupérer les disponibilités pour ce spectacle
        List<Availability> availabilities = availabilityRepository.findAvailableByShowId(showId);
        
        if (availabilities.isEmpty()) {
            throw new IllegalStateException("No available actors for show " + showId);
        }
        
        // Récupérer les informations du spectacle
        Optional<Show> showOpt = showRepository.findById(showId);
        if (showOpt.isEmpty()) {
            throw new IllegalArgumentException("Show not found: " + showId);
        }
        
        Show show = showOpt.get();
        int maxActors = show.getMaxActors();
        int minActors = show.getMinActors();
        
        // Algorithme de tirage intelligent
        List<String> availableUserIds = availabilities.stream()
            .map(Availability::getUserId)
            .collect(Collectors.toList());
        
        // Mélanger la liste pour un tirage aléatoire
        Collections.shuffle(availableUserIds);
        
        // Sélectionner les acteurs selon les contraintes
        List<String> selectedActors = availableUserIds.stream()
            .limit(Math.min(maxActors, availableUserIds.size()))
            .collect(Collectors.toList());
        
        if (selectedActors.size() < minActors) {
            throw new IllegalStateException("Not enough available actors. Required: " + minActors + ", Available: " + selectedActors.size());
        }
        
        // Assigner les rôles
        Map<String, String> assignedRoles = new HashMap<>();
        String[] roles = {"Protagoniste", "Antagoniste", "Personnage secondaire", "Figurant"};
        
        for (int i = 0; i < selectedActors.size(); i++) {
            String userId = selectedActors.get(i);
            String role = i < roles.length ? roles[i] : "Personnage secondaire";
            assignedRoles.put(userId, role);
        }
        
        // Assigner les rôles de remplacement
        List<String> remainingActors = availableUserIds.stream()
            .filter(id -> !selectedActors.contains(id))
            .collect(Collectors.toList());
        
        Map<String, String> backupRoles = new HashMap<>();
        for (int i = 0; i < Math.min(remainingActors.size(), 3); i++) {
            String userId = remainingActors.get(i);
            String role = assignedRoles.get(selectedActors.get(i % selectedActors.size()));
            backupRoles.put(userId, role);
        }
        
        // Mettre à jour le casting
        casting.setAvailableUserIds(availableUserIds);
        casting.setAssignedRoles(assignedRoles);
        casting.setBackupRoles(backupRoles);
        casting.setStatus(Casting.CastingStatus.COMPLETED);
        casting.setUpdatedAt(LocalDateTime.now());
        
        return castingRepository.save(casting);
    }
    
    public Casting assignRoles(String showId, Map<String, String> assignedRoles, Map<String, String> backupRoles) {
        Optional<Casting> castingOpt = castingRepository.findByShowId(showId);
        if (castingOpt.isEmpty()) {
            throw new IllegalArgumentException("Casting not found for show " + showId);
        }
        
        Casting casting = castingOpt.get();
        
        // Validation des rôles assignés
        for (String userId : assignedRoles.keySet()) {
            if (!userRepository.existsById(userId)) {
                throw new IllegalArgumentException("User not found: " + userId);
            }
        }
        
        casting.setAssignedRoles(assignedRoles);
        casting.setBackupRoles(backupRoles);
        casting.setStatus(Casting.CastingStatus.COMPLETED);
        casting.setUpdatedAt(LocalDateTime.now());
        
        return castingRepository.save(casting);
    }
    
    public Casting validateCasting(String showId) {
        Optional<Casting> castingOpt = castingRepository.findByShowId(showId);
        if (castingOpt.isEmpty()) {
            throw new IllegalArgumentException("Casting not found for show " + showId);
        }
        
        Casting casting = castingOpt.get();
        
        if (casting.getAssignedRoles() == null || casting.getAssignedRoles().isEmpty()) {
            throw new IllegalStateException("Cannot validate casting without assigned roles");
        }
        
        casting.setStatus(Casting.CastingStatus.COMPLETED);
        casting.setUpdatedAt(LocalDateTime.now());
        
        // Mettre à jour le statut du spectacle
        Optional<Show> showOpt = showRepository.findById(showId);
        if (showOpt.isPresent()) {
            Show show = showOpt.get();
            show.setStatus(Show.ShowStatus.CASTED);
            show.setUpdatedAt(LocalDateTime.now());
            showRepository.save(show);
        }
        
        return castingRepository.save(casting);
    }
    
    public List<Casting> findByStatus(Casting.CastingStatus status) {
        return castingRepository.findByStatus(status);
    }
    
    public void deleteCasting(String id) {
        if (!castingRepository.existsById(id)) {
            throw new IllegalArgumentException("Casting with id " + id + " not found");
        }
        
        castingRepository.deleteById(id);
    }
}