#!/usr/bin/env node

/**
 * 🔍 Script pour tester les logs d'audit et la recherche
 * Usage: node test-audit-logs.js
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

async function testAuditLogs() {
  console.log('🔍 Testing audit logs and search...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Check audit collection structure
    console.log('\n📋 Test 1: Audit collection structure')
    
    try {
      const auditQuery = await db.collection('audit')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${auditQuery.size} recent audit entries`)
      
      auditQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n📊 Audit Entry:', {
          id: doc.id,
          action: data.action,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          user: data.user,
          email: data.email,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (auditError) {
      console.log('❌ Error reading audit collection:', auditError.message)
    }
    
    // Test 2: Check for specific actions
    console.log('\n📋 Test 2: Specific actions')
    
    const actions = [
      'password_reset_requested',
      'password_reset_completed',
      'user_login',
      'user_logout',
      'auth_error',
      'function_called',
      'function_error',
      'cors_error',
      'system_error'
    ]
    
    for (const action of actions) {
      try {
        const actionQuery = await db.collection('audit')
          .where('action', '==', action)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get()
        
        if (actionQuery.size > 0) {
          const doc = actionQuery.docs[0]
          const data = doc.data()
          console.log(`\n🔍 ${action}:`, {
            lastOccurrence: data.timestamp?.toDate?.() || data.timestamp,
            success: data.success,
            error: data.error
          })
        } else {
          console.log(`\n🔍 ${action}: No recent occurrences`)
        }
        
      } catch (actionError) {
        console.log(`❌ Error checking ${action}:`, actionError.message)
      }
    }
    
    // Test 3: Check for recent errors
    console.log('\n📋 Test 3: Recent errors')
    
    try {
      const errorQuery = await db.collection('audit')
        .where('success', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
      
      console.log(`❌ Found ${errorQuery.size} recent errors`)
      
      errorQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ Error:', {
          id: doc.id,
          action: data.action,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          email: data.email,
          error: data.error,
          code: data.code
        })
      })
      
    } catch (errorQueryError) {
      console.log('❌ Error reading recent errors:', errorQueryError.message)
    }
    
    // Test 4: Check for specific user activities
    console.log('\n📋 Test 4: Specific user activities')
    
    const testUsers = [
      'patrice.lamarque@gmail.com',
      'Marjory_64@hotmail.fr'
    ]
    
    for (const userEmail of testUsers) {
      try {
        const userQuery = await db.collection('audit')
          .where('email', '==', userEmail)
          .orderBy('timestamp', 'desc')
          .limit(5)
          .get()
        
        console.log(`\n👤 ${userEmail}: Found ${userQuery.size} recent activities`)
        
        userQuery.forEach(doc => {
          const data = doc.data()
          console.log(`  📊 ${data.action}:`, {
            timestamp: data.timestamp?.toDate?.() || data.timestamp,
            success: data.success,
            error: data.error
          })
        })
        
      } catch (userError) {
        console.log(`❌ Error checking ${userEmail}:`, userError.message)
      }
    }
    
    // Test 5: Check for recent password reset activities
    console.log('\n📋 Test 5: Recent password reset activities')
    
    try {
      const resetQuery = await db.collection('audit')
        .where('action', 'in', ['password_reset_requested', 'password_reset_completed'])
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
      
      console.log(`🔑 Found ${resetQuery.size} recent password reset activities`)
      
      resetQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🔑 Password Reset:', {
          id: doc.id,
          action: data.action,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (resetError) {
      console.log('❌ Error reading password reset activities:', resetError.message)
    }
    
    // Test 6: Check for recent authentication activities
    console.log('\n📋 Test 6: Recent authentication activities')
    
    try {
      const authQuery = await db.collection('audit')
        .where('action', 'in', ['user_login', 'user_logout', 'auth_error'])
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
      
      console.log(`🔐 Found ${authQuery.size} recent authentication activities`)
      
      authQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🔐 Auth Activity:', {
          id: doc.id,
          action: data.action,
          email: data.email,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (authError) {
      console.log('❌ Error reading authentication activities:', authError.message)
    }
    
    // Test 7: Check for recent function activities
    console.log('\n📋 Test 7: Recent function activities')
    
    try {
      const functionQuery = await db.collection('audit')
        .where('action', 'in', ['function_called', 'function_error', 'function_deployed'])
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
      
      console.log(`📞 Found ${functionQuery.size} recent function activities`)
      
      functionQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n📞 Function Activity:', {
          id: doc.id,
          action: data.action,
          function: data.function,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (functionError) {
      console.log('❌ Error reading function activities:', functionError.message)
    }
    
    console.log('\n✅ Audit logs tests completed!')
    
  } catch (error) {
    console.log('❌ ERROR during audit logs tests:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await testAuditLogs()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()