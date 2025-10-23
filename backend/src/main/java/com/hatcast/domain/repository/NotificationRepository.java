package com.hatcast.domain.repository;

import com.hatcast.domain.model.Notification;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    Optional<Notification> findById(String id);
    List<Notification> findByUserId(String userId);
    List<Notification> findByStatus(Notification.NotificationStatus status);
    List<Notification> findByType(Notification.NotificationType type);
    Notification save(Notification notification);
    void deleteById(String id);
    boolean existsById(String id);
}