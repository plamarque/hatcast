#!/usr/bin/env node

/**
 * 🔍 Test script pour vérifier les tokens de reset password en production
 * Usage: node test-production-token.js "TOKEN_ICI"
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

async function testProductionToken(token) {
  console.log('🔍 Testing production token verification...')
  console.log('🔍 Token:', token.substring(0, 20) + '...' + token.substring(token.length - 20))
  console.log('🔍 Token length:', token.length)
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Verify the token with Firebase Admin
    console.log('\n📋 Test 1: Firebase Admin verifyPasswordResetCode')
    const userRecord = await auth.verifyPasswordResetCode(token)
    console.log('✅ Token is valid!')
    console.log('🔍 User email:', userRecord.email)
    console.log('🔍 User UID:', userRecord.uid)
    console.log('🔍 User metadata:', {
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime
    })
    
    // Test 2: Check if user exists
    console.log('\n📋 Test 2: User existence check')
    try {
      const user = await auth.getUser(userRecord.uid)
      console.log('✅ User exists in Firebase Auth')
      console.log('🔍 User details:', {
        email: user.email,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        providerData: user.providerData.map(p => ({ providerId: p.providerId, email: p.email }))
      })
    } catch (userError) {
      console.log('❌ User not found:', userError.message)
    }
    
    // Test 3: Check token expiration
    console.log('\n📋 Test 3: Token expiration check')
    try {
      // Try to use the token (this will fail if expired)
      await auth.verifyPasswordResetCode(token)
      console.log('✅ Token is not expired')
    } catch (expError) {
      console.log('❌ Token expired or invalid:', expError.message)
    }
    
    return {
      success: true,
      email: userRecord.email,
      uid: userRecord.uid
    }
    
  } catch (error) {
    console.log('❌ Token verification failed!')
    console.log('❌ Error type:', error.constructor.name)
    console.log('❌ Error message:', error.message)
    console.log('❌ Error code:', error.code)
    console.log('❌ Error stack:', error.stack)
    
    // Detailed error analysis
    if (error.code === 'auth/invalid-action-code') {
      console.log('🔍 Analysis: Token is invalid or malformed')
    } else if (error.code === 'auth/expired-action-code') {
      console.log('🔍 Analysis: Token has expired')
    } else if (error.code === 'auth/user-disabled') {
      console.log('🔍 Analysis: User account is disabled')
    } else if (error.code === 'auth/user-not-found') {
      console.log('🔍 Analysis: User does not exist')
    } else {
      console.log('🔍 Analysis: Unknown error -', error.code)
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }
}

// Main execution
async function main() {
  const token = process.argv[2]
  
  if (!token) {
    console.log('❌ Usage: node test-production-token.js "TOKEN_ICI"')
    process.exit(1)
  }
  
  console.log('🚀 Starting production token test...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Firebase Admin initialized:', !!admin.apps.length)
  
  const result = await testProductionToken(token)
  
  console.log('\n📊 FINAL RESULT:')
  console.log('🔍 Success:', result.success)
  if (result.success) {
    console.log('🔍 Email:', result.email)
    console.log('🔍 UID:', result.uid)
  } else {
    console.log('🔍 Error:', result.error)
    console.log('🔍 Code:', result.code)
  }
  
  process.exit(result.success ? 0 : 1)
}

main().catch(error => {
  console.error('❌ CRITICAL ERROR:', error)
  process.exit(1)
})
