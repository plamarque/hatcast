package com.hatcast.infrastructure.firestore;

import com.google.cloud.firestore.Firestore;
import com.hatcast.domain.model.Show;
import com.hatcast.domain.repository.ShowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class FirestoreShowRepository implements ShowRepository {
    
    private final Firestore firestore;
    private static final String COLLECTION_NAME = "shows";
    
    @Autowired
    public FirestoreShowRepository(Firestore firestore) {
        this.firestore = firestore;
    }
    
    @Override
    public Optional<Show> findById(String id) {
        try {
            var doc = firestore.collection(COLLECTION_NAME).document(id).get().get();
            if (doc.exists()) {
                return Optional.of(doc.toObject(Show.class));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding show by id: " + id, e);
        }
    }
    
    @Override
    public List<Show> findAll() {
        try {
            var querySnapshot = firestore.collection(COLLECTION_NAME).get().get();
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Show.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding all shows", e);
        }
    }
    
    @Override
    public List<Show> findBySeasonId(String seasonId) {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("seasonId", seasonId);
            var querySnapshot = query.get().get();
            
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Show.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding shows by season: " + seasonId, e);
        }
    }
    
    @Override
    public List<Show> findActive() {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("active", true);
            var querySnapshot = query.get().get();
            
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Show.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding active shows", e);
        }
    }
    
    @Override
    public List<Show> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereGreaterThanOrEqualTo("showDate", startDate)
                    .whereLessThanOrEqualTo("showDate", endDate);
            var querySnapshot = query.get().get();
            
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Show.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding shows by date range", e);
        }
    }
    
    @Override
    public List<Show> findByStatus(Show.ShowStatus status) {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("status", status.toString());
            var querySnapshot = query.get().get();
            
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Show.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding shows by status: " + status, e);
        }
    }
    
    @Override
    public Show save(Show show) {
        try {
            if (show.getId() == null) {
                var docRef = firestore.collection(COLLECTION_NAME).document();
                show.setId(docRef.getId());
            }
            
            firestore.collection(COLLECTION_NAME).document(show.getId()).set(show).get();
            return show;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving show: " + show.getId(), e);
        }
    }
    
    @Override
    public void deleteById(String id) {
        try {
            firestore.collection(COLLECTION_NAME).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error deleting show: " + id, e);
        }
    }
    
    @Override
    public boolean existsById(String id) {
        try {
            var doc = firestore.collection(COLLECTION_NAME).document(id).get().get();
            return doc.exists();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error checking if show exists: " + id, e);
        }
    }
}