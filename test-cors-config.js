#!/usr/bin/env node

/**
 * 🔍 Script pour tester la configuration CORS des Cloud Functions
 * Usage: node test-cors-config.js
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'impro-selector',
    credential: admin.credential.applicationDefault()
  })
}

const db = admin.firestore()

async function testCorsConfig() {
  console.log('🔍 Testing CORS configuration...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Check CORS configuration in Firestore
    console.log('\n📋 Test 1: CORS configuration in Firestore')
    
    try {
      const corsDoc = await db.collection('config').doc('cors').get()
      if (corsDoc.exists) {
        const corsData = corsDoc.data()
        console.log('✅ CORS config found in Firestore')
        console.log('🔍 CORS data:', corsData)
      } else {
        console.log('❌ No CORS config found in Firestore')
      }
    } catch (corsError) {
      console.log('❌ Error reading CORS config:', corsError.message)
    }
    
    // Test 2: Check environment configuration
    console.log('\n📋 Test 2: Environment configuration')
    
    try {
      const envDoc = await db.collection('config').doc('environment').get()
      if (envDoc.exists) {
        const envData = envDoc.data()
        console.log('✅ Environment config found in Firestore')
        console.log('🔍 Environment data:', envData)
      } else {
        console.log('❌ No environment config found in Firestore')
      }
    } catch (envError) {
      console.log('❌ Error reading environment config:', envError.message)
    }
    
    // Test 3: Check all config documents
    console.log('\n📋 Test 3: All config documents')
    
    try {
      const configSnapshot = await db.collection('config').get()
      console.log(`📊 Found ${configSnapshot.size} config documents`)
      
      configSnapshot.forEach(doc => {
        console.log(`\n📄 Config document: ${doc.id}`)
        const data = doc.data()
        console.log('🔍 Data keys:', Object.keys(data))
        
        // Show relevant CORS-related data
        if (data.origins || data.cors || data.allowedOrigins) {
          console.log('🔍 CORS-related data:', {
            origins: data.origins,
            cors: data.cors,
            allowedOrigins: data.allowedOrigins
          })
        }
      })
      
    } catch (configError) {
      console.log('❌ Error reading config collection:', configError.message)
    }
    
    // Test 4: Check for recent CORS errors in audit logs
    console.log('\n📋 Test 4: Recent CORS errors in audit logs')
    
    try {
      const auditQuery = await db.collection('audit')
        .where('action', '==', 'cors_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${auditQuery.size} recent CORS errors`)
      
      auditQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ CORS Error:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          error: data.error,
          origin: data.origin,
          function: data.function
        })
      })
      
    } catch (auditError) {
      console.log('❌ Error reading CORS audit logs:', auditError.message)
    }
    
    // Test 5: Check for recent function call errors
    console.log('\n📋 Test 5: Recent function call errors')
    
    try {
      const functionQuery = await db.collection('audit')
        .where('action', '==', 'function_call_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${functionQuery.size} recent function call errors`)
      
      functionQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ Function Call Error:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          function: data.function,
          error: data.error,
          origin: data.origin
        })
      })
      
    } catch (functionError) {
      console.log('❌ Error reading function call errors:', functionError.message)
    }
    
    console.log('\n✅ CORS configuration tests completed!')
    
  } catch (error) {
    console.log('❌ ERROR during CORS config tests:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await testCorsConfig()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
