#!/usr/bin/env node

/**
 * Script de migration : Convertir les sélections de noms vers IDs de joueurs
 * 
 * Ce script :
 * 1. Récupère tous les joueurs avec leurs IDs
 * 2. Récupère toutes les sélections
 * 3. Convertit les noms en IDs dans playerStatuses et roles
 * 4. Sauvegarde les sélections migrées
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

// Initialiser Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const db = getFirestore(app, 'development') // Utiliser la base de dev pour les tests

async function migrateSelectionsToPlayerIds() {
  console.log('🚀 Début de la migration des sélections vers les IDs de joueurs...')
  
  try {
    // 1. Récupérer tous les joueurs avec leurs IDs
    console.log('📋 Récupération des joueurs...')
    const playersSnapshot = await db.collection('seasons').doc('o0kD2IJekMdGdiJeIg4O').collection('players').get()
    
    const playersMap = new Map() // nom -> {id, data}
    playersSnapshot.forEach(doc => {
      const data = doc.data()
      playersMap.set(data.name, {
        id: doc.id,
        data: data
      })
    })
    
    console.log(`✅ ${playersMap.size} joueurs trouvés :`)
    playersMap.forEach((player, name) => {
      console.log(`  - ${name} → ${player.id}`)
    })
    
    // 2. Récupérer toutes les sélections
    console.log('\n📋 Récupération des sélections...')
    const selectionsSnapshot = await db.collection('seasons').doc('o0kD2IJekMdGdiJeIg4O').collection('selections').get()
    
    console.log(`✅ ${selectionsSnapshot.size} sélections trouvées`)
    
    // 3. Migrer chaque sélection
    for (const selectionDoc of selectionsSnapshot.docs) {
      const selectionId = selectionDoc.id
      const selectionData = selectionDoc.data()
      
      console.log(`\n🔄 Migration de la sélection ${selectionId}...`)
      
      // Migrer playerStatuses
      const migratedPlayerStatuses = {}
      if (selectionData.playerStatuses) {
        console.log('  📝 Migration des playerStatuses...')
        Object.entries(selectionData.playerStatuses).forEach(([playerName, status]) => {
          const player = playersMap.get(playerName)
          if (player) {
            migratedPlayerStatuses[player.id] = status
            console.log(`    ${playerName} → ${player.id} (${status})`)
          } else {
            console.warn(`    ⚠️  Joueur non trouvé : ${playerName}`)
          }
        })
      }
      
      // Migrer roles
      const migratedRoles = {}
      if (selectionData.roles) {
        console.log('  📝 Migration des roles...')
        Object.entries(selectionData.roles).forEach(([role, playerNames]) => {
          if (Array.isArray(playerNames)) {
            migratedRoles[role] = playerNames.map(playerName => {
              const player = playersMap.get(playerName)
              if (player) {
                console.log(`    ${role}: ${playerName} → ${player.id}`)
                return player.id
              } else {
                console.warn(`    ⚠️  Joueur non trouvé dans ${role}: ${playerName}`)
                return playerName // Garder le nom si pas trouvé
              }
            })
          }
        })
      }
      
      // 4. Sauvegarder la sélection migrée
      const migratedData = {
        ...selectionData,
        playerStatuses: migratedPlayerStatuses,
        roles: migratedRoles,
        migratedAt: new Date(),
        migrationVersion: '1.0'
      }
      
      await db.collection('seasons').doc('o0kD2IJekMdGdiJeIg4O').collection('selections').doc(selectionId).set(migratedData)
      console.log(`  ✅ Sélection ${selectionId} migrée avec succès`)
    }
    
    console.log('\n🎉 Migration terminée avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error)
    process.exit(1)
  }
}

// Exécuter la migration
migrateSelectionsToPlayerIds()
  .then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale :', error)
    process.exit(1)
  })

