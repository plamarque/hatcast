#!/usr/bin/env node

/**
 * 🔍 Script pour tester l'authentification et les tokens
 * Usage: node test-authentication.js
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'impro-selector',
    credential: admin.credential.applicationDefault()
  })
}

const auth = admin.auth()

async function testAuthentication() {
  console.log('🔍 Testing authentication system...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Check authentication service
    console.log('\n📋 Test 1: Authentication service')
    console.log('✅ Auth service available:', !!auth)
    console.log('🔍 Auth methods:', Object.getOwnPropertyNames(auth.constructor.prototype).filter(name => name.startsWith('verify')))
    
    // Test 2: Check for recent authentication events
    console.log('\n📋 Test 2: Recent authentication events')
    
    try {
      const authQuery = await db.collection('audit')
        .where('action', 'in', ['user_login', 'user_logout', 'password_reset_requested', 'password_reset_completed'])
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
      
      console.log(`📊 Found ${authQuery.size} recent authentication events`)
      
      authQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🔐 Auth Event:', {
          id: doc.id,
          action: data.action,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (authError) {
      console.log('❌ Error reading auth events:', authError.message)
    }
    
    // Test 3: Check for recent password reset attempts
    console.log('\n📋 Test 3: Recent password reset attempts')
    
    try {
      const resetQuery = await db.collection('audit')
        .where('action', '==', 'password_reset_requested')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${resetQuery.size} recent password reset attempts`)
      
      resetQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🔑 Password Reset Attempt:', {
          id: doc.id,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (resetError) {
      console.log('❌ Error reading password reset attempts:', resetError.message)
    }
    
    // Test 4: Check for recent authentication errors
    console.log('\n📋 Test 4: Recent authentication errors')
    
    try {
      const errorQuery = await db.collection('audit')
        .where('action', '==', 'auth_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`❌ Found ${errorQuery.size} recent authentication errors`)
      
      errorQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ Auth Error:', {
          id: doc.id,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          error: data.error,
          code: data.code
        })
      })
      
    } catch (errorQueryError) {
      console.log('❌ Error reading auth errors:', errorQueryError.message)
    }
    
    // Test 5: Check for recent token verification errors
    console.log('\n📋 Test 5: Recent token verification errors')
    
    try {
      const tokenQuery = await db.collection('audit')
        .where('action', '==', 'token_verification_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`❌ Found ${tokenQuery.size} recent token verification errors`)
      
      tokenQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ Token Verification Error:', {
          id: doc.id,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          error: data.error,
          code: data.code,
          tokenType: data.tokenType
        })
      })
      
    } catch (tokenError) {
      console.log('❌ Error reading token verification errors:', tokenError.message)
    }
    
    // Test 6: Check for recent user creation events
    console.log('\n📋 Test 6: Recent user creation events')
    
    try {
      const userQuery = await db.collection('audit')
        .where('action', '==', 'user_created')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${userQuery.size} recent user creation events`)
      
      userQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n👤 User Created:', {
          id: doc.id,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (userError) {
      console.log('❌ Error reading user creation events:', userError.message)
    }
    
    // Test 7: Check for recent user updates
    console.log('\n📋 Test 7: Recent user updates')
    
    try {
      const updateQuery = await db.collection('audit')
        .where('action', '==', 'user_updated')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${updateQuery.size} recent user updates`)
      
      updateQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n👤 User Updated:', {
          id: doc.id,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          error: data.error,
          changes: data.changes
        })
      })
      
    } catch (updateError) {
      console.log('❌ Error reading user updates:', updateError.message)
    }
    
    console.log('\n✅ Authentication system tests completed!')
    
  } catch (error) {
    console.log('❌ ERROR during authentication tests:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await testAuthentication()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
