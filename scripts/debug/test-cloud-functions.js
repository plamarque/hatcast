#!/usr/bin/env node

/**
 * 🔍 Script pour tester les Cloud Functions et leur configuration
 * Usage: node test-cloud-functions.js
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

async function testCloudFunctions() {
  console.log('🔍 Testing Cloud Functions configuration...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Check Cloud Functions configuration
    console.log('\n📋 Test 1: Cloud Functions configuration')
    
    try {
      const functionsDoc = await db.collection('config').doc('functions').get()
      if (functionsDoc.exists) {
        const functionsData = functionsDoc.data()
        console.log('✅ Functions config found in Firestore')
        console.log('🔍 Functions data:', functionsData)
      } else {
        console.log('❌ No functions config found in Firestore')
      }
    } catch (functionsError) {
      console.log('❌ Error reading functions config:', functionsError.message)
    }
    
    // Test 2: Check for recent function deployments
    console.log('\n📋 Test 2: Recent function deployments')
    
    try {
      const deploymentQuery = await db.collection('audit')
        .where('action', '==', 'function_deployed')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${deploymentQuery.size} recent function deployments`)
      
      deploymentQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🚀 Function Deployment:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          function: data.function,
          version: data.version,
          success: data.success
        })
      })
      
    } catch (deploymentError) {
      console.log('❌ Error reading function deployments:', deploymentError.message)
    }
    
    // Test 3: Check for recent function errors
    console.log('\n📋 Test 3: Recent function errors')
    
    try {
      const errorQuery = await db.collection('audit')
        .where('action', '==', 'function_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${errorQuery.size} recent function errors`)
      
      errorQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ Function Error:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          function: data.function,
          error: data.error,
          stack: data.stack
        })
      })
      
    } catch (errorQueryError) {
      console.log('❌ Error reading function errors:', errorQueryError.message)
    }
    
    // Test 4: Check for recent function calls
    console.log('\n📋 Test 4: Recent function calls')
    
    try {
      const callQuery = await db.collection('audit')
        .where('action', '==', 'function_called')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${callQuery.size} recent function calls`)
      
      callQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n📞 Function Call:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          function: data.function,
          success: data.success,
          duration: data.duration
        })
      })
      
    } catch (callError) {
      console.log('❌ Error reading function calls:', callError.message)
    }
    
    // Test 5: Check for specific admin functions
    console.log('\n📋 Test 5: Specific admin functions')
    
    const adminFunctions = [
      'checkAdminStatus',
      'setLogLevel',
      'resetPasswordWithCustomToken'
    ]
    
    for (const funcName of adminFunctions) {
      try {
        const funcQuery = await db.collection('audit')
          .where('action', '==', 'function_called')
          .where('function', '==', funcName)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get()
        
        if (funcQuery.size > 0) {
          const doc = funcQuery.docs[0]
          const data = doc.data()
          console.log(`\n🔍 ${funcName}:`, {
            lastCall: data.timestamp?.toDate?.() || data.timestamp,
            success: data.success,
            error: data.error
          })
        } else {
          console.log(`\n🔍 ${funcName}: No recent calls found`)
        }
        
      } catch (funcError) {
        console.log(`❌ Error checking ${funcName}:`, funcError.message)
      }
    }
    
    console.log('\n✅ Cloud Functions tests completed!')
    
  } catch (error) {
    console.log('❌ ERROR during Cloud Functions tests:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await testCloudFunctions()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
