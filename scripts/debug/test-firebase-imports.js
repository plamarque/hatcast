#!/usr/bin/env node

/**
 * 🔍 Script pour tester les imports Firebase et la configuration
 * Usage: node test-firebase-imports.js
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'impro-selector',
    credential: admin.credential.applicationDefault()
  })
}

async function testFirebaseImports() {
  console.log('🔍 Testing Firebase imports and configuration...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Check Firebase Admin initialization
    console.log('\n📋 Test 1: Firebase Admin initialization')
    console.log('✅ Firebase Admin initialized:', !!admin.apps.length)
    console.log('🔍 App name:', admin.apps[0]?.name)
    console.log('🔍 Project ID:', admin.apps[0]?.options?.projectId)
    
    // Test 2: Check Auth service
    console.log('\n📋 Test 2: Auth service')
    const auth = admin.auth()
    console.log('✅ Auth service available:', !!auth)
    console.log('🔍 Auth methods:', Object.getOwnPropertyNames(auth.constructor.prototype).filter(name => name.startsWith('verify')))
    
    // Test 3: Check Firestore service
    console.log('\n📋 Test 3: Firestore service')
    const db = admin.firestore()
    console.log('✅ Firestore service available:', !!db)
    
    // Test 4: Check Functions service
    console.log('\n📋 Test 4: Functions service')
    const functions = admin.functions()
    console.log('✅ Functions service available:', !!functions)
    
    // Test 5: Check Storage service
    console.log('\n📋 Test 5: Storage service')
    const storage = admin.storage()
    console.log('✅ Storage service available:', !!storage)
    
    // Test 6: Test specific auth methods
    console.log('\n📋 Test 6: Specific auth methods')
    const authMethods = [
      'verifyPasswordResetCode',
      'generatePasswordResetLink',
      'confirmPasswordReset',
      'getUser',
      'getUserByEmail'
    ]
    
    authMethods.forEach(method => {
      const isAvailable = typeof auth[method] === 'function'
      console.log(`🔍 ${method}:`, isAvailable ? '✅ Available' : '❌ Not available')
    })
    
    // Test 7: Check environment variables
    console.log('\n📋 Test 7: Environment variables')
    const envVars = [
      'FIREBASE_PROJECT_ID',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'FIREBASE_CONFIG'
    ]
    
    envVars.forEach(envVar => {
      const value = process.env[envVar]
      console.log(`🔍 ${envVar}:`, value ? '✅ Set' : '❌ Not set')
      if (value && envVar !== 'GOOGLE_APPLICATION_CREDENTIALS') {
        console.log(`   Value: ${value}`)
      }
    })
    
    // Test 8: Check Firebase config
    console.log('\n📋 Test 8: Firebase config')
    const config = admin.apps[0]?.options
    console.log('🔍 Config keys:', Object.keys(config || {}))
    console.log('🔍 Database URL:', config?.databaseURL || 'Not set')
    console.log('🔍 Storage Bucket:', config?.storageBucket || 'Not set')
    
    console.log('\n✅ All Firebase imports and configuration tests completed!')
    
  } catch (error) {
    console.log('❌ ERROR during Firebase import tests:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await testFirebaseImports()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
