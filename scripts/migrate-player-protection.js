#!/usr/bin/env node

/**
 * Script de migration pour synchroniser les données de playerProtection vers les documents players
 * 
 * Usage: node scripts/migrate-player-protection.js [seasonId]
 * Si seasonId n'est pas fourni, migre toutes les saisons
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { migratePlayerProtectionToPlayers } from '../src/services/playerProtection.js'

// Configuration Firebase (utilise les variables d'environnement)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

async function main() {
  try {
    console.log('🚀 Démarrage de la migration playerProtection vers players...')
    
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    const targetSeasonId = process.argv[2]
    
    if (targetSeasonId) {
      // Migration d'une saison spécifique
      console.log(`📋 Migration de la saison: ${targetSeasonId}`)
      const result = await migratePlayerProtectionToPlayers(targetSeasonId)
      console.log(`✅ Migration terminée: ${result.migrated}/${result.total} joueurs migrés, ${result.errors} erreurs`)
    } else {
      // Migration de toutes les saisons
      console.log('📋 Migration de toutes les saisons...')
      
      const seasonsSnapshot = await getDocs(collection(db, 'seasons'))
      const seasons = seasonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      console.log(`📊 ${seasons.length} saisons trouvées`)
      
      let totalMigrated = 0
      let totalErrors = 0
      let totalPlayers = 0
      
      for (const season of seasons) {
        console.log(`\n🔄 Migration de la saison: ${season.name || season.id}`)
        try {
          const result = await migratePlayerProtectionToPlayers(season.id)
          totalMigrated += result.migrated
          totalErrors += result.errors
          totalPlayers += result.total
          console.log(`   ✅ ${result.migrated}/${result.total} joueurs migrés`)
        } catch (error) {
          console.error(`   ❌ Erreur pour ${season.id}:`, error.message)
          totalErrors++
        }
      }
      
      console.log(`\n🎉 Migration globale terminée:`)
      console.log(`   📊 ${totalPlayers} joueurs au total`)
      console.log(`   ✅ ${totalMigrated} joueurs migrés`)
      console.log(`   ❌ ${totalErrors} erreurs`)
    }
    
    console.log('\n✨ Migration terminée avec succès!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

main()
