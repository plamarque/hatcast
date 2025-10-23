package com.hatcast.infrastructure.firestore;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.hatcast.domain.model.Season;
import com.hatcast.domain.repository.SeasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class FirestoreSeasonRepository implements SeasonRepository {
    
    private final Firestore firestore;
    private static final String COLLECTION_NAME = "seasons";
    
    @Autowired
    public FirestoreSeasonRepository(Firestore firestore) {
        this.firestore = firestore;
    }
    
    @Override
    public Optional<Season> findById(String id) {
        try {
            var doc = firestore.collection(COLLECTION_NAME).document(id).get().get();
            if (doc.exists()) {
                return Optional.of(doc.toObject(Season.class));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding season by id: " + id, e);
        }
    }
    
    @Override
    public List<Season> findAll() {
        try {
            var querySnapshot = firestore.collection(COLLECTION_NAME).get().get();
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Season.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding all seasons", e);
        }
    }
    
    @Override
    public List<Season> findActive() {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("active", true);
            var querySnapshot = query.get().get();
            
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Season.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding active seasons", e);
        }
    }
    
    @Override
    public List<Season> findByDateRange(LocalDate startDate, LocalDate endDate) {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereGreaterThanOrEqualTo("startDate", startDate)
                    .whereLessThanOrEqualTo("endDate", endDate);
            var querySnapshot = query.get().get();
            
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(Season.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding seasons by date range", e);
        }
    }
    
    @Override
    public Season save(Season season) {
        try {
            if (season.getId() == null) {
                var docRef = firestore.collection(COLLECTION_NAME).document();
                season.setId(docRef.getId());
            }
            
            firestore.collection(COLLECTION_NAME).document(season.getId()).set(season).get();
            return season;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving season: " + season.getId(), e);
        }
    }
    
    @Override
    public void deleteById(String id) {
        try {
            firestore.collection(COLLECTION_NAME).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error deleting season: " + id, e);
        }
    }
    
    @Override
    public boolean existsById(String id) {
        try {
            var doc = firestore.collection(COLLECTION_NAME).document(id).get().get();
            return doc.exists();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error checking if season exists: " + id, e);
        }
    }
}