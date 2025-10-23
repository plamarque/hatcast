import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

// Mock Firebase Auth
vi.mock('@/services/firestore/firestoreService', () => ({
  auth: {
    currentUser: null
  }
}))

// Mock API service
vi.mock('@/services/api/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn()
  }
}))

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = useAuthStore()
    
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.userRole).toBe('GUEST')
    expect(store.isAdmin).toBe(false)
  })

  it('should set user correctly', () => {
    const store = useAuthStore()
    const userData = {
      id: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'USER'
    }
    
    store.setUser(userData)
    
    expect(store.user).toEqual(userData)
    expect(store.isAuthenticated).toBe(true)
    expect(store.userRole).toBe('USER')
    expect(store.isAdmin).toBe(false)
  })

  it('should set admin user correctly', () => {
    const store = useAuthStore()
    const adminUser = {
      id: 'admin-123',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'ADMIN'
    }
    
    store.setUser(adminUser)
    
    expect(store.user).toEqual(adminUser)
    expect(store.isAuthenticated).toBe(true)
    expect(store.userRole).toBe('ADMIN')
    expect(store.isAdmin).toBe(true)
  })

  it('should clear error when setting user', () => {
    const store = useAuthStore()
    store.setError('Some error')
    expect(store.error).toBe('Some error')
    
    const userData = { id: 'user-123', email: 'test@example.com' }
    store.setUser(userData)
    
    expect(store.error).toBeNull()
  })

  it('should set loading state', () => {
    const store = useAuthStore()
    
    store.setLoading(true)
    expect(store.loading).toBe(true)
    
    store.setLoading(false)
    expect(store.loading).toBe(false)
  })

  it('should set and clear error', () => {
    const store = useAuthStore()
    
    store.setError('Test error')
    expect(store.error).toBe('Test error')
    
    store.clearError()
    expect(store.error).toBeNull()
  })
})