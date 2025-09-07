#!/usr/bin/env node

/**
 * 🔍 Script pour reproduire le problème de reset password
 * Usage: node reproduce-password-reset-issue.js
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

async function reproducePasswordResetIssue() {
  console.log('🔍 Reproducing password reset issue...')
  console.log('🔍 Environment: production')
  console.log('🔍 Project: impro-selector')
  console.log('🔍 Timestamp:', new Date().toISOString())
  
  const testEmail = 'patrice.lamarque@gmail.com'
  
  try {
    // Step 1: Check if user exists
    console.log('\n📋 Step 1: Check if user exists')
    let user
    try {
      user = await auth.getUserByEmail(testEmail)
      console.log('✅ User exists:', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        disabled: user.disabled
      })
    } catch (userError) {
      console.log('❌ User not found:', userError.message)
      return
    }
    
    // Step 2: Generate a password reset email
    console.log('\n📋 Step 2: Generate password reset email')
    try {
      const resetLink = await auth.generatePasswordResetLink(testEmail, {
        url: 'https://selections.la-malice.fr/reset-password',
        handleCodeInApp: true
      })
      
      console.log('✅ Password reset link generated')
      console.log('🔍 Link length:', resetLink.length)
      
      // Extract oobCode from the link
      const url = new URL(resetLink)
      const oobCode = url.searchParams.get('oobCode')
      
      if (oobCode) {
        console.log('🔍 oobCode extracted:', oobCode.substring(0, 20) + '...')
        console.log('🔍 oobCode length:', oobCode.length)
        
        // Step 3: Test the oobCode
        console.log('\n📋 Step 3: Test oobCode verification')
        try {
          const verifiedUser = await auth.verifyPasswordResetCode(oobCode)
          console.log('✅ oobCode verification successful!')
          console.log('🔍 Verified email:', verifiedUser.email)
          console.log('🔍 Verified UID:', verifiedUser.uid)
          
          // Step 4: Test password reset
          console.log('\n📋 Step 4: Test password reset')
          try {
            const newPassword = 'TestPassword123!'
            await auth.confirmPasswordReset(oobCode, newPassword)
            console.log('✅ Password reset successful!')
            
            // Step 5: Test login with new password
            console.log('\n📋 Step 5: Test login with new password')
            try {
              const userCredential = await auth.signInWithEmailAndPassword(testEmail, newPassword)
              console.log('✅ Login successful with new password!')
              console.log('🔍 User UID:', userCredential.user.uid)
              
              // Reset password back to original (for testing)
              console.log('\n📋 Step 6: Reset password back to original')
              try {
                await auth.updatePassword(userCredential.user, 'TestPassword123!')
                console.log('✅ Password reset back to original')
              } catch (resetError) {
                console.log('❌ Error resetting password back:', resetError.message)
              }
              
            } catch (loginError) {
              console.log('❌ Login failed:', loginError.message)
            }
            
          } catch (resetError) {
            console.log('❌ Password reset failed:', resetError.message)
          }
          
        } catch (verifyError) {
          console.log('❌ oobCode verification failed:', verifyError.message)
          console.log('❌ Error code:', verifyError.code)
        }
        
      } else {
        console.log('❌ No oobCode found in reset link')
      }
      
    } catch (linkError) {
      console.log('❌ Failed to generate reset link:', linkError.message)
    }
    
  } catch (error) {
    console.log('❌ CRITICAL ERROR:', error.message)
    console.log('❌ Error stack:', error.stack)
  }
}

// Main execution
async function main() {
  try {
    await reproducePasswordResetIssue()
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    process.exit(1)
  }
}

main()
