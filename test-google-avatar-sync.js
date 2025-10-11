#!/usr/bin/env node

/**
 * Test script for Google Avatar Synchronization
 * 
 * This script tests the new avatar sync functionality:
 * 1. Simulates a Google sign-in with a photoURL
 * 2. Finds all players associated with the test email
 * 3. Verifies that the photoURL is synced to all player documents
 * 
 * Usage:
 *   node test-google-avatar-sync.js <test-email>
 * 
 * Example:
 *   node test-google-avatar-sync.js patrice.lamarque@gmail.com
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const testEmail = process.argv[2]

if (!testEmail) {
  console.error('❌ Please provide a test email as argument')
  console.error('Usage: node test-google-avatar-sync.js <test-email>')
  process.exit(1)
}

console.log('🔍 Testing Google Avatar Sync')
console.log('================================')
console.log(`Test email: ${testEmail}`)
console.log('')

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testAvatarSync() {
  try {
    console.log('📋 Step 1: Finding players associated with email...')
    
    // Find all seasons
    const seasonsSnapshot = await getDocs(collection(db, 'seasons'))
    console.log(`Found ${seasonsSnapshot.size} season(s)`)
    
    const allPlayers = []
    
    // For each season, find players with this email
    for (const seasonDoc of seasonsSnapshot.docs) {
      const seasonId = seasonDoc.id
      const seasonName = seasonDoc.data().name || seasonId
      
      const playersRef = collection(db, 'seasons', seasonId, 'players')
      const playersQuery = query(playersRef, where('email', '==', testEmail))
      const playersSnapshot = await getDocs(playersQuery)
      
      if (playersSnapshot.size > 0) {
        console.log(`  ✓ Season "${seasonName}": ${playersSnapshot.size} player(s)`)
        
        playersSnapshot.forEach(playerDoc => {
          const playerData = playerDoc.data()
          allPlayers.push({
            seasonId,
            seasonName,
            playerId: playerDoc.id,
            playerName: playerData.name || playerDoc.id,
            email: playerData.email,
            photoURL: playerData.photoURL || null,
            hasPhotoURL: !!playerData.photoURL
          })
        })
      }
    }
    
    if (allPlayers.length === 0) {
      console.log('❌ No players found associated with this email')
      return
    }
    
    console.log('')
    console.log('📊 Step 2: Checking current photoURL status...')
    console.log('')
    
    let playersWithAvatar = 0
    let playersWithoutAvatar = 0
    
    allPlayers.forEach(player => {
      const status = player.hasPhotoURL ? '✅ Has avatar' : '⚠️  No avatar'
      console.log(`  ${status} - ${player.seasonName} / ${player.playerName}`)
      if (player.hasPhotoURL) {
        console.log(`    URL: ${player.photoURL}`)
        playersWithAvatar++
      } else {
        playersWithoutAvatar++
      }
    })
    
    console.log('')
    console.log('📈 Summary:')
    console.log(`  Total players: ${allPlayers.length}`)
    console.log(`  With avatar: ${playersWithAvatar}`)
    console.log(`  Without avatar: ${playersWithoutAvatar}`)
    
    console.log('')
    console.log('💡 Next steps:')
    console.log('  1. Sign in with Google using this email')
    console.log('  2. The app will automatically sync the Google avatar')
    console.log('  3. Run this script again to verify the sync worked')
    
    if (playersWithAvatar === allPlayers.length) {
      console.log('')
      console.log('✅ All players already have avatars synced!')
    }
    
  } catch (error) {
    console.error('❌ Error testing avatar sync:', error.message)
    console.error(error)
  }
}

// Run the test
testAvatarSync().then(() => {
  console.log('')
  console.log('✅ Test completed')
  process.exit(0)
}).catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})

