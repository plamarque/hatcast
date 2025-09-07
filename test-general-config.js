#!/usr/bin/env node

/**
 * 🔍 Script pour tester la configuration générale du système
 * Usage: node test-general-config.js
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

async function testGeneralConfig() {
  console.log('🔍 Testing general system configuration...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Check system configuration
    console.log('\n📋 Test 1: System configuration')
    
    try {
      const configDoc = await db.collection('config').doc('system').get()
      if (configDoc.exists) {
        const configData = configDoc.data()
        console.log('✅ System config found in Firestore')
        console.log('🔍 System config keys:', Object.keys(configData))
        console.log('🔍 System config:', configData)
      } else {
        console.log('❌ No system config found in Firestore')
      }
    } catch (configError) {
      console.log('❌ Error reading system config:', configError.message)
    }
    
    // Test 2: Check environment configuration
    console.log('\n📋 Test 2: Environment configuration')
    
    try {
      const envDoc = await db.collection('config').doc('environment').get()
      if (envDoc.exists) {
        const envData = envDoc.data()
        console.log('✅ Environment config found in Firestore')
        console.log('🔍 Environment config keys:', Object.keys(envData))
        console.log('🔍 Environment config:', envData)
      } else {
        console.log('❌ No environment config found in Firestore')
      }
    } catch (envError) {
      console.log('❌ Error reading environment config:', envError.message)
    }
    
    // Test 3: Check all configuration documents
    console.log('\n📋 Test 3: All configuration documents')
    
    try {
      const configSnapshot = await db.collection('config').get()
      console.log(`📊 Found ${configSnapshot.size} configuration documents`)
      
      configSnapshot.forEach(doc => {
        console.log(`\n📄 Config document: ${doc.id}`)
        const data = doc.data()
        console.log('🔍 Data keys:', Object.keys(data))
        
        // Show relevant data without sensitive information
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'object' && data[key] !== null) {
            console.log(`🔍 ${key}:`, Object.keys(data[key]))
          } else {
            console.log(`🔍 ${key}:`, typeof data[key])
          }
        })
      })
      
    } catch (configError) {
      console.log('❌ Error reading config collection:', configError.message)
    }
    
    // Test 4: Check for recent system errors
    console.log('\n📋 Test 4: Recent system errors')
    
    try {
      const errorQuery = await db.collection('audit')
        .where('action', '==', 'system_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`❌ Found ${errorQuery.size} recent system errors`)
      
      errorQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ System Error:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          error: data.error,
          component: data.component,
          severity: data.severity
        })
      })
      
    } catch (errorQueryError) {
      console.log('❌ Error reading system errors:', errorQueryError.message)
    }
    
    // Test 5: Check for recent configuration changes
    console.log('\n📋 Test 5: Recent configuration changes')
    
    try {
      const configChangeQuery = await db.collection('audit')
        .where('action', '==', 'config_changed')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`📊 Found ${configChangeQuery.size} recent configuration changes`)
      
      configChangeQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n📊 Config Change:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          config: data.config,
          changes: data.changes,
          user: data.user
        })
      })
      
    } catch (configChangeError) {
      console.log('❌ Error reading config changes:', configChangeError.message)
    }
    
    // Test 6: Check for recent deployment events
    console.log('\n📋 Test 6: Recent deployment events')
    
    try {
      const deploymentQuery = await db.collection('audit')
        .where('action', '==', 'deployment')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`🚀 Found ${deploymentQuery.size} recent deployment events`)
      
      deploymentQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🚀 Deployment:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          environment: data.environment,
          version: data.version,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (deploymentError) {
      console.log('❌ Error reading deployment events:', deploymentError.message)
    }
    
    // Test 7: Check for recent maintenance events
    console.log('\n📋 Test 7: Recent maintenance events')
    
    try {
      const maintenanceQuery = await db.collection('audit')
        .where('action', '==', 'maintenance')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log(`🔧 Found ${maintenanceQuery.size} recent maintenance events`)
      
      maintenanceQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🔧 Maintenance:', {
          id: doc.id,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          type: data.type,
          description: data.description,
          success: data.success,
          error: data.error
        })
      })
      
    } catch (maintenanceError) {
      console.log('❌ Error reading maintenance events:', maintenanceError.message)
    }
    
    console.log('\n✅ General configuration tests completed!')
    
  } catch (error) {
    console.log('❌ ERROR during general config tests:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await testGeneralConfig()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
