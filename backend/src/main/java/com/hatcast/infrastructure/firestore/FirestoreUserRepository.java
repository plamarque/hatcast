package com.hatcast.infrastructure.firestore;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.hatcast.domain.model.User;
import com.hatcast.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class FirestoreUserRepository implements UserRepository {
    
    private final Firestore firestore;
    private static final String COLLECTION_NAME = "users";
    
    @Autowired
    public FirestoreUserRepository(Firestore firestore) {
        this.firestore = firestore;
    }
    
    @Override
    public Optional<User> findById(String id) {
        try {
            var doc = firestore.collection(COLLECTION_NAME).document(id).get().get();
            if (doc.exists()) {
                return Optional.of(doc.toObject(User.class));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding user by id: " + id, e);
        }
    }
    
    @Override
    public Optional<User> findByEmail(String email) {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("email", email)
                    .limit(1);
            var querySnapshot = query.get().get();
            
            if (!querySnapshot.isEmpty()) {
                return Optional.of(querySnapshot.getDocuments().get(0).toObject(User.class));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding user by email: " + email, e);
        }
    }
    
    @Override
    public List<User> findAll() {
        try {
            var querySnapshot = firestore.collection(COLLECTION_NAME).get().get();
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(User.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding all users", e);
        }
    }
    
    @Override
    public List<User> findByRole(User.UserRole role) {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("role", role.toString());
            var querySnapshot = query.get().get();
            
            return querySnapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(User.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error finding users by role: " + role, e);
        }
    }
    
    @Override
    public User save(User user) {
        try {
            if (user.getId() == null) {
                // Create new document
                var docRef = firestore.collection(COLLECTION_NAME).document();
                user.setId(docRef.getId());
            }
            
            firestore.collection(COLLECTION_NAME).document(user.getId()).set(user).get();
            return user;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving user: " + user.getId(), e);
        }
    }
    
    @Override
    public void deleteById(String id) {
        try {
            firestore.collection(COLLECTION_NAME).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error deleting user: " + id, e);
        }
    }
    
    @Override
    public boolean existsById(String id) {
        try {
            var doc = firestore.collection(COLLECTION_NAME).document(id).get().get();
            return doc.exists();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error checking if user exists: " + id, e);
        }
    }
    
    @Override
    public boolean existsByEmail(String email) {
        try {
            var query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("email", email)
                    .limit(1);
            var querySnapshot = query.get().get();
            return !querySnapshot.isEmpty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error checking if user exists by email: " + email, e);
        }
    }
}