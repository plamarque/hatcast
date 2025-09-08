#!/usr/bin/env node

/**
 * 🔍 Script pour tester le système d'emails et la queue
 * Usage: node test-email-system.js
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

async function testEmailSystem() {
  console.log('🔍 Testing email system...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  try {
    // Test 1: Check email queue status
    console.log('\n📋 Test 1: Email queue status')
    
    try {
      const mailQuery = await db.collection('mail')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
      
      console.log(`📧 Found ${mailQuery.size} recent emails in queue`)
      
      mailQuery.forEach(doc => {
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
      
    } catch (mailError) {
      console.log('❌ Error reading mail queue:', mailError.message)
    }
    
    // Test 2: Check for password reset emails
    console.log('\n📋 Test 2: Password reset emails')
    
    try {
      const resetQuery = await db.collection('mail')
        .where('subject', '==', 'Réinitialisation de votre mot de passe')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
      
      console.log(`📧 Found ${resetQuery.size} password reset emails`)
      
      resetQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n🔑 Password Reset Email:', {
          id: doc.id,
          to: data.to,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          delivery: {
            state: data.delivery?.state,
            error: data.delivery?.error,
            attempts: data.delivery?.attempts
          }
        })
      })
      
    } catch (resetError) {
      console.log('❌ Error reading password reset emails:', resetError.message)
    }
    
    // Test 3: Check for email verification emails
    console.log('\n📋 Test 3: Email verification emails')
    
    try {
      const verifyQuery = await db.collection('mail')
        .where('subject', '==', 'Vérifiez votre adresse email')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
      
      console.log(`📧 Found ${verifyQuery.size} email verification emails`)
      
      verifyQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n✅ Email Verification:', {
          id: doc.id,
          to: data.to,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          delivery: {
            state: data.delivery?.state,
            error: data.delivery?.error,
            attempts: data.delivery?.attempts
          }
        })
      })
      
    } catch (verifyError) {
      console.log('❌ Error reading email verification emails:', verifyError.message)
    }
    
    // Test 4: Check for failed email deliveries
    console.log('\n📋 Test 4: Failed email deliveries')
    
    try {
      const failedQuery = await db.collection('mail')
        .where('delivery.state', '==', 'FAILED')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
      
      console.log(`❌ Found ${failedQuery.size} failed email deliveries`)
      
      failedQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n❌ Failed Email:', {
          id: doc.id,
          to: data.to,
          subject: data.subject,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          error: data.delivery?.error,
          attempts: data.delivery?.attempts
        })
      })
      
    } catch (failedError) {
      console.log('❌ Error reading failed emails:', failedError.message)
    }
    
    // Test 5: Check for pending email deliveries
    console.log('\n📋 Test 5: Pending email deliveries')
    
    try {
      const pendingQuery = await db.collection('mail')
        .where('delivery.state', '==', 'PENDING')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
      
      console.log(`⏳ Found ${pendingQuery.size} pending email deliveries`)
      
      pendingQuery.forEach(doc => {
        const data = doc.data()
        console.log('\n⏳ Pending Email:', {
          id: doc.id,
          to: data.to,
          subject: data.subject,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          attempts: data.delivery?.attempts
        })
      })
      
    } catch (pendingError) {
      console.log('❌ Error reading pending emails:', pendingError.message)
    }
    
    // Test 6: Check email configuration
    console.log('\n📋 Test 6: Email configuration')
    
    try {
      const emailConfigDoc = await db.collection('config').doc('email').get()
      if (emailConfigDoc.exists) {
        const emailConfig = emailConfigDoc.data()
        console.log('✅ Email config found in Firestore')
        console.log('🔍 Email config keys:', Object.keys(emailConfig))
        
        // Don't log sensitive data
        if (emailConfig.smtp) {
          console.log('🔍 SMTP configured:', !!emailConfig.smtp.host)
        }
        if (emailConfig.ethereal) {
          console.log('🔍 Ethereal configured:', !!emailConfig.ethereal.user)
        }
      } else {
        console.log('❌ No email config found in Firestore')
      }
    } catch (emailConfigError) {
      console.log('❌ Error reading email config:', emailConfigError.message)
    }
    
    console.log('\n✅ Email system tests completed!')
    
  } catch (error) {
    console.log('❌ ERROR during email system tests:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await testEmailSystem()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
