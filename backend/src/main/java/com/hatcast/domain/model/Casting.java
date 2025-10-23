package com.hatcast.domain.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Casting {
    private String id;
    
    @NotBlank(message = "Show ID is required")
    private String showId;
    
    @NotNull(message = "Casting date is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime castingDate;
    
    private CastingStatus status = CastingStatus.OPEN;
    
    private List<String> availableUserIds;
    private Map<String, String> assignedRoles; // userId -> role
    private Map<String, String> backupRoles; // userId -> role
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private boolean active = true;
    
    // Constructors
    public Casting() {}
    
    public Casting(String showId, LocalDateTime castingDate) {
        this.showId = showId;
        this.castingDate = castingDate;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getShowId() { return showId; }
    public void setShowId(String showId) { this.showId = showId; }
    
    public LocalDateTime getCastingDate() { return castingDate; }
    public void setCastingDate(LocalDateTime castingDate) { this.castingDate = castingDate; }
    
    public CastingStatus getStatus() { return status; }
    public void setStatus(CastingStatus status) { this.status = status; }
    
    public List<String> getAvailableUserIds() { return availableUserIds; }
    public void setAvailableUserIds(List<String> availableUserIds) { this.availableUserIds = availableUserIds; }
    
    public Map<String, String> getAssignedRoles() { return assignedRoles; }
    public void setAssignedRoles(Map<String, String> assignedRoles) { this.assignedRoles = assignedRoles; }
    
    public Map<String, String> getBackupRoles() { return backupRoles; }
    public void setBackupRoles(Map<String, String> backupRoles) { this.backupRoles = backupRoles; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public enum CastingStatus {
        OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    }
}