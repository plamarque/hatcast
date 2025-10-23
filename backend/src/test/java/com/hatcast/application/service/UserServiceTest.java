package com.hatcast.application.service;

import com.hatcast.domain.model.User;
import com.hatcast.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    private User testUser;
    
    @BeforeEach
    void setUp() {
        testUser = new User("user-123", "test@example.com", "Test User", User.UserRole.USER);
    }
    
    @Test
    void findById_ExistingUser_ReturnsUser() {
        // Given
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        
        // When
        Optional<User> result = userService.findById("user-123");
        
        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
        verify(userRepository).findById("user-123");
    }
    
    @Test
    void findById_NonExistingUser_ReturnsEmpty() {
        // Given
        when(userRepository.findById("non-existing")).thenReturn(Optional.empty());
        
        // When
        Optional<User> result = userService.findById("non-existing");
        
        // Then
        assertFalse(result.isPresent());
        verify(userRepository).findById("non-existing");
    }
    
    @Test
    void createUser_ValidUser_ReturnsCreatedUser() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        // When
        User result = userService.createUser(testUser);
        
        // Then
        assertEquals(testUser, result);
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository).save(testUser);
    }
    
    @Test
    void createUser_ExistingEmail_ThrowsException() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.createUser(testUser)
        );
        
        assertEquals("User with email test@example.com already exists", exception.getMessage());
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    void updateUser_ExistingUser_ReturnsUpdatedUser() {
        // Given
        when(userRepository.existsById("user-123")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        // When
        User result = userService.updateUser("user-123", testUser);
        
        // Then
        assertEquals(testUser, result);
        verify(userRepository).existsById("user-123");
        verify(userRepository).save(testUser);
    }
    
    @Test
    void updateUser_NonExistingUser_ThrowsException() {
        // Given
        when(userRepository.existsById("non-existing")).thenReturn(false);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.updateUser("non-existing", testUser)
        );
        
        assertEquals("User with id non-existing not found", exception.getMessage());
        verify(userRepository).existsById("non-existing");
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    void deleteUser_ExistingUser_DeletesUser() {
        // Given
        when(userRepository.existsById("user-123")).thenReturn(true);
        
        // When
        userService.deleteUser("user-123");
        
        // Then
        verify(userRepository).existsById("user-123");
        verify(userRepository).deleteById("user-123");
    }
    
    @Test
    void deleteUser_NonExistingUser_ThrowsException() {
        // Given
        when(userRepository.existsById("non-existing")).thenReturn(false);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.deleteUser("non-existing")
        );
        
        assertEquals("User with id non-existing not found", exception.getMessage());
        verify(userRepository).existsById("non-existing");
        verify(userRepository, never()).deleteById(any(String.class));
    }
}