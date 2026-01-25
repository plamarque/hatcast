#!/usr/bin/env node

/**
 * 🔍 Script de monitoring en temps réel pour les erreurs de reset password
 * Usage: node monitor-password-reset-errors.js
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

async function monitorPasswordResetErrors() {
  console.log('🔍 Starting password reset error monitoring...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  // Monitor Firestore for password reset emails
  console.log('\n📧 Monitoring Firestore mail collection...')
  
  const mailQuery = db.collection('mail')
    .where('to', '==', 'patrice.lamarque@gmail.com')
    .orderBy('createdAt', 'desc')
    .limit(10)
  
  try {
    const snapshot = await mailQuery.get()
    console.log(`📧 Found ${snapshot.size} emails for patrice.lamarque@gmail.com`)
    
    snapshot.forEach(doc => {
      const data = doc.data()
      console.log('\n📧 Email:', {
        id: doc.id,
        to: data.to,
        subject: data.subject,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        delivery: {
          state: data.delivery?.state,
          error: data.delivery?.error,
          attempts: data.delivery?.attempts
        }
      })
    })
    
  } catch (error) {
    console.log('❌ Error querying mail collection:', error.message)
  }
  
  // Monitor for recent password reset attempts
  console.log('\n🔍 Checking for recent password reset attempts...')
  
  try {
    const auditQuery = await db.collection('audit')
      .where('action', '==', 'password_reset_requested')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get()
    
    console.log(`📊 Found ${auditQuery.size} recent password reset attempts`)
    
    auditQuery.forEach(doc => {
      const data = doc.data()
      console.log('\n📊 Password Reset Attempt:', {
        id: doc.id,
        email: data.email,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
        success: data.success,
        error: data.error
      })
    })
    
  } catch (error) {
    console.log('❌ Error querying audit collection:', error.message)
  }
  
  // Monitor for authentication errors
  console.log('\n🔍 Checking for recent authentication errors...')
  
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
    
  } catch (error) {
    console.log('❌ Error querying auth errors:', error.message)
  }
  
  console.log('\n✅ Monitoring complete!')
}

// Main execution
async function main() {
  try {
    await monitorPasswordResetErrors()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
