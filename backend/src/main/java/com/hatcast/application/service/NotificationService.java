package com.hatcast.application.service;

import com.hatcast.domain.model.Notification;
import com.hatcast.domain.model.User;
import com.hatcast.domain.repository.NotificationRepository;
import com.hatcast.domain.repository.UserRepository;
import com.hatcast.application.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    @Autowired
    public NotificationService(NotificationRepository notificationRepository, 
                             UserRepository userRepository, EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    
    public Notification createNotification(String userId, String title, String message, 
                                        Notification.NotificationType type, Map<String, Object> data) {
        Notification notification = new Notification(userId, title, message, type);
        if (data != null) {
            notification.setData(data);
        }
        
        return notificationRepository.save(notification);
    }
    
    public void sendNotification(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            throw new IllegalArgumentException("Notification not found: " + notificationId);
        }
        
        Notification notification = notificationOpt.get();
        
        // Récupérer l'utilisateur
        Optional<User> userOpt = userRepository.findById(notification.getUserId());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + notification.getUserId());
        }
        
        User user = userOpt.get();
        
        try {
            // Envoyer l'email selon le type de notification
            switch (notification.getType()) {
                case CASTING_REMINDER:
                    sendCastingReminderEmail(user, notification);
                    break;
                case NEW_SHOW:
                    sendNewShowEmail(user, notification);
                    break;
                case CASTING_RESULT:
                    sendCastingResultEmail(user, notification);
                    break;
                case PASSWORD_RESET:
                    sendPasswordResetEmail(user, notification);
                    break;
                case WELCOME:
                    sendWelcomeEmail(user, notification);
                    break;
                default:
                    sendGenericEmail(user, notification);
            }
            
            // Mettre à jour le statut
            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
            
        } catch (Exception e) {
            // Marquer comme échoué
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepository.save(notification);
            throw new RuntimeException("Failed to send notification: " + e.getMessage(), e);
        }
    }
    
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserId(userId);
    }
    
    public List<Notification> getNotificationsByStatus(Notification.NotificationStatus status) {
        return notificationRepository.findByStatus(status);
    }
    
    public List<Notification> getNotificationsByType(Notification.NotificationType type) {
        return notificationRepository.findByType(type);
    }
    
    public void markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setStatus(Notification.NotificationStatus.READ);
            notificationRepository.save(notification);
        }
    }
    
    public void deleteNotification(String id) {
        if (!notificationRepository.existsById(id)) {
            throw new IllegalArgumentException("Notification with id " + id + " not found");
        }
        
        notificationRepository.deleteById(id);
    }
    
    private void sendCastingReminderEmail(User user, Notification notification) {
        Map<String, Object> templateData = Map.of(
            "user_name", user.getDisplayName(),
            "message", notification.getMessage(),
            "show_title", notification.getData().getOrDefault("showTitle", "Nouveau spectacle")
        );
        
        emailService.sendCastingReminder(user.getEmail(), user.getDisplayName(), templateData);
    }
    
    private void sendNewShowEmail(User user, Notification notification) {
        Map<String, Object> templateData = Map.of(
            "user_name", user.getDisplayName(),
            "show_title", notification.getData().getOrDefault("showTitle", "Nouveau spectacle"),
            "show_date", notification.getData().getOrDefault("showDate", "Date à confirmer"),
            "show_location", notification.getData().getOrDefault("showLocation", "Lieu à confirmer")
        );
        
        emailService.sendNewShowNotification(user.getEmail(), user.getDisplayName(), templateData);
    }
    
    private void sendCastingResultEmail(User user, Notification notification) {
        Map<String, Object> templateData = Map.of(
            "user_name", user.getDisplayName(),
            "show_title", notification.getData().getOrDefault("showTitle", "Spectacle"),
            "assigned_role", notification.getData().getOrDefault("assignedRole", "Rôle assigné"),
            "is_selected", notification.getData().getOrDefault("isSelected", false)
        );
        
        emailService.sendCastingResult(user.getEmail(), user.getDisplayName(), templateData);
    }
    
    private void sendPasswordResetEmail(User user, Notification notification) {
        String resetLink = (String) notification.getData().get("resetLink");
        emailService.sendPasswordReset(user.getEmail(), user.getDisplayName(), resetLink);
    }
    
    private void sendWelcomeEmail(User user, Notification notification) {
        emailService.sendWelcomeEmail(user.getEmail(), user.getDisplayName());
    }
    
    private void sendGenericEmail(User user, Notification notification) {
        // Pour les notifications génériques, utiliser le template de rappel
        Map<String, Object> templateData = Map.of(
            "user_name", user.getDisplayName(),
            "message", notification.getMessage(),
            "title", notification.getTitle()
        );
        
        emailService.sendCastingReminder(user.getEmail(), user.getDisplayName(), templateData);
    }
}