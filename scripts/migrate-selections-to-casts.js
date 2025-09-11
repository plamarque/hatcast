#!/usr/bin/env node

/**
 * Script de migration des sélections vers les casts
 * 
 * Ce script migre les données de la sous-collection 'selections' vers 'casts'
 * en convertissant les noms de joueurs en IDs et en restructurant les données.
 * 
 * Structure source (selections) :
 * - players: [noms de joueurs]
 * - confirmed: boolean
 * - confirmedAt: timestamp
 * - confirmedByAllPlayers: boolean
 * - playerStatuses: {nom: statut}
 * 
 * Structure cible (casts) :
 * - roles: {role: [IDs de joueurs]}
 * - confirmed: boolean
 * - confirmedAt: timestamp
 * - confirmedByAllPlayers: boolean
 * - playerStatuses: {ID: statut}
 * - status: string (calculé)
 * - statusDetails: object (calculé)
 */

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialiser Firebase Admin avec l'authentification par défaut (Firebase CLI)
const app = initializeApp({
  projectId: 'impro-selector'
})

const db = getFirestore(app) // Utiliser la base de production (default)

// Configuration
const TARGET_SEASON_IDS = [
  'CJO14iKkFzkf3pULI2VM',  // Première saison
  'o0kD2IJekMdGdiJeIg4O'   // Saison principale (plus importante)
]

// Options de migration
const MIGRATE_AVAILABILITIES = true  // Migrer aussi les disponibilités
console.log('🚀 Script de migration complet: selections + availabilities')
console.log(`📊 Saisons cibles: ${TARGET_SEASON_IDS.join(', ')}`)
console.log(`📋 Migrations: selections → casts${MIGRATE_AVAILABILITIES ? ' + availabilities → players/{id}/availability' : ''}`)
console.log('🔍 Mode: EXÉCUTION RÉELLE sur la base de PRODUCTION')
console.log('⚠️  ATTENTION: Migration des données de production!')
console.log('')

// Statistiques
const stats = {
  seasonsProcessed: 0,
  eventsProcessed: 0,
  selectionsMigrated: 0,
  availabilitiesMigrated: 0,
  errors: 0,
  warnings: 0
}

/**
 * Convertir un nom de joueur en ID
 */
async function getPlayerIdByName(playerName, seasonId) {
  try {
    const playersSnapshot = await db.collection('seasons').doc(seasonId).collection('players').get()
    
    for (const playerDoc of playersSnapshot.docs) {
      const playerData = playerDoc.data()
      if (playerData.name === playerName) {
        return playerDoc.id
      }
    }
    
    console.warn(`⚠️  Joueur non trouvé: ${playerName} dans la saison ${seasonId}`)
    stats.warnings++
    return null
  } catch (error) {
    console.error(`❌ Erreur lors de la recherche du joueur ${playerName}:`, error.message)
    stats.errors++
    return null
  }
}

/**
 * Récupérer tous les joueurs d'une saison avec leur mapping nom -> ID
 */
async function getPlayersMapping(seasonId) {
  try {
    const playersSnapshot = await db.collection('seasons').doc(seasonId).collection('players').get()
    const mapping = {}
    
    for (const playerDoc of playersSnapshot.docs) {
      const playerData = playerDoc.data()
      mapping[playerData.name] = playerDoc.id
    }
    
    return mapping
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des joueurs de la saison ${seasonId}:`, error.message)
    stats.errors++
    return {}
  }
}

/**
 * Calculer le statut d'une composition
 */
function calculateCastStatus(roles, playerStatuses, confirmed, confirmedByAllPlayers) {
  const allPlayers = Object.values(roles).flat().filter(Boolean)
  const requiredCount = allPlayers.length
  const availableCount = allPlayers.filter(playerId => {
    const status = playerStatuses[playerId]
    return status === 'confirmed' || status === 'pending'
  }).length
  
  const declinedCount = allPlayers.filter(playerId => {
    const status = playerStatuses[playerId]
    return status === 'declined'
  }).length
  
  const hasEmptySlots = allPlayers.some(playerId => !playerId)
  const hasInsufficientPlayers = availableCount < requiredCount
  const hasDeclinedPlayers = declinedCount > 0
  const hasUnavailablePlayers = allPlayers.some(playerId => {
    const status = playerStatuses[playerId]
    return status === 'unavailable'
  })
  
  let status = 'ready'
  
  if (confirmed && confirmedByAllPlayers) {
    status = 'confirmed'
  } else if (confirmed && !confirmedByAllPlayers) {
    status = 'pending_confirmation'
  } else if (hasEmptySlots) {
    status = 'incomplete'
  } else if (hasInsufficientPlayers) {
    status = 'insufficient'
  } else if (hasDeclinedPlayers || hasUnavailablePlayers) {
    status = 'incomplete'
  } else {
    status = 'complete'
  }
  
  return {
    status,
    statusDetails: {
      availableCount,
      requiredCount,
      declinedPlayers: allPlayers.filter(playerId => playerStatuses[playerId] === 'declined'),
      hasDeclinedPlayers,
      hasEmptySlots,
      hasInsufficientPlayers,
      hasUnavailablePlayers,
      unavailablePlayers: allPlayers.filter(playerId => playerStatuses[playerId] === 'unavailable')
    }
  }
}

/**
 * Migrer une sélection vers un cast
 */
async function migrateSelection(seasonId, eventId, selectionData, playersMapping) {
  try {
    console.log(`  📝 Migration de la sélection ${eventId}...`)
    
    // Récupérer les joueurs de l'ancienne structure
    const players = selectionData.players || []
    
    // MIGRER MÊME SI VIDE (règle définie)
    if (!Array.isArray(players)) {
      console.warn(`    ⚠️  Structure players invalide dans la sélection ${eventId}`)
      stats.warnings++
      return null
    }
    
    // Convertir les noms en IDs (migration partielle si certains joueurs manquent)
    const playerIds = []
    const missingPlayers = []
    
    for (const playerName of players) {
      const playerId = playersMapping[playerName]
      if (playerId) {
        playerIds.push(playerId)
      } else {
        missingPlayers.push(playerName)
        console.warn(`    ⚠️  Joueur non trouvé: ${playerName}`)
        stats.warnings++
      }
    }
    
    // Gestion des rôles
    let roles = {}
    
    if (selectionData.roles && typeof selectionData.roles === 'object') {
      // Convertir les rôles existants de noms vers IDs
      console.log(`    ℹ️  Rôles existants trouvés, conversion...`)
      for (const [roleName, rolePlayers] of Object.entries(selectionData.roles)) {
        if (Array.isArray(rolePlayers)) {
          const rolePlayerIds = []
          for (const playerName of rolePlayers) {
            const playerId = playersMapping[playerName]
            if (playerId) {
              rolePlayerIds.push(playerId)
            } else {
              console.warn(`    ⚠️  Joueur non trouvé dans le rôle ${roleName}: ${playerName}`)
              stats.warnings++
            }
          }
          roles[roleName] = rolePlayerIds
        }
      }
    } else {
      // Pas de rôles → tous les joueurs sont des "players" (règle définie)
      console.warn(`    ⚠️  Aucun rôles trouvés, création du rôle 'player' par défaut`)
      stats.warnings++
      roles = {
        player: playerIds
      }
    }
    
    // Convertir les playerStatuses de noms vers IDs
    const newPlayerStatuses = {}
    const oldPlayerStatuses = selectionData.playerStatuses || {}
    
    // Pour tous les joueurs trouvés
    for (const playerId of playerIds) {
      // Trouver le nom correspondant à cet ID
      let playerName = null
      for (const [name, id] of Object.entries(playersMapping)) {
        if (id === playerId) {
          playerName = name
          break
        }
      }
      
      if (playerName && oldPlayerStatuses[playerName]) {
        newPlayerStatuses[playerId] = oldPlayerStatuses[playerName]
      } else {
        // Statut par défaut
        newPlayerStatuses[playerId] = 'pending'
      }
    }
    
    // Calculer le statut
    const castStatus = calculateCastStatus(
      roles,
      newPlayerStatuses,
      selectionData.confirmed || false,
      selectionData.confirmedByAllPlayers || false
    )
    
    // Créer la nouvelle structure de cast
    const castData = {
      roles,
      confirmed: selectionData.confirmed || false,
      confirmedAt: selectionData.confirmedAt || null,
      confirmedByAllPlayers: selectionData.confirmedByAllPlayers || false,
      playerStatuses: newPlayerStatuses,
      status: castStatus.status,
      statusDetails: castStatus.statusDetails,
      updatedAt: new Date()
    }
    
    // Sauvegarder dans la nouvelle collection
    await db.collection('seasons').doc(seasonId).collection('casts').doc(eventId).set(castData)
    
    const successMessage = playerIds.length > 0 
      ? `✅ Migration réussie: ${playerIds.length} joueurs, statut: ${castStatus.status}`
      : `✅ Migration réussie: sélection vide, statut: ${castStatus.status}`
    
    if (missingPlayers.length > 0) {
      console.log(`    ${successMessage} (${missingPlayers.length} joueurs manquants: ${missingPlayers.join(', ')})`)
    } else {
      console.log(`    ${successMessage}`)
    }
    
    stats.selectionsMigrated++
    
    return castData
    
  } catch (error) {
    console.error(`    ❌ Erreur lors de la migration de ${eventId}:`, error.message)
    stats.errors++
    return null
  }
}

/**
 * Migrer les disponibilités d'une saison
 */
async function migrateAvailabilities(seasonId, seasonName, playersMapping) {
  if (!MIGRATE_AVAILABILITIES) {
    console.log(`  ⏭️  Migration des disponibilités désactivée`)
    return
  }
  
  console.log(`\n📅 Migration des disponibilités: ${seasonName} (${seasonId})`)
  
  try {
    // Récupérer tous les événements de la saison
    const eventsSnapshot = await db.collection('seasons').doc(seasonId).collection('events').get()
    const events = {}
    eventsSnapshot.forEach(doc => {
      events[doc.id] = doc.data()
    })
    console.log(`  📊 ${Object.keys(events).length} événement(s) trouvé(s)`)
    
    // Récupérer toutes les disponibilités de l'ancienne structure
    const availabilitySnapshot = await db.collection('seasons').doc(seasonId).collection('availability').get()
    
    if (availabilitySnapshot.empty) {
      console.log(`  ℹ️  Aucune disponibilité trouvée dans l'ancienne structure`)
      return
    }
    
    console.log(`  📊 ${availabilitySnapshot.size} disponibilité(s) trouvée(s) dans l'ancienne structure`)
    
    // Migrer chaque disponibilité
    for (const availabilityDoc of availabilitySnapshot.docs) {
      const playerName = availabilityDoc.id
      const availabilityData = availabilityDoc.data()
      
      await migratePlayerAvailabilities(seasonId, playerName, availabilityData, playersMapping, events)
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors de la migration des disponibilités de ${seasonName}:`, error.message)
    stats.errors++
  }
}

/**
 * Migrer les disponibilités d'un joueur
 */
async function migratePlayerAvailabilities(seasonId, playerName, availabilityData, playersMapping, events) {
  try {
    console.log(`  📝 Migration des disponibilités de ${playerName}...`)
    
    // Trouver l'ID du joueur
    const playerId = playersMapping[playerName]
    if (!playerId) {
      console.warn(`    ⚠️  Joueur non trouvé: ${playerName}`)
      stats.warnings++
      return
    }
    
    // Migrer chaque disponibilité
    for (const [eventId, eventAvailability] of Object.entries(availabilityData)) {
      // Ignorer les champs métadonnées
      if (eventId === 'id' || eventId === 'updatedAt') {
        continue
      }
      
      // Vérifier que l'événement existe
      if (!events[eventId]) {
        console.warn(`    ⚠️  Événement non trouvé: ${eventId}`)
        stats.warnings++
        continue
      }
      
      // Vérifier que les données de disponibilité sont valides
      if (!eventAvailability || typeof eventAvailability !== 'object') {
        console.warn(`    ⚠️  Données de disponibilité invalides pour ${eventId}:`, eventAvailability)
        stats.warnings++
        continue
      }
      
      // Ne créer un document que si available est défini (true ou false)
      if (eventAvailability.available === undefined) {
        console.log(`    ℹ️  Pas de disponibilité définie pour ${eventId}, ignoré`)
        continue
      }
      
      // Créer la nouvelle structure de disponibilité
      const newAvailabilityData = {
        available: !!eventAvailability.available,
        roles: Array.isArray(eventAvailability.roles) ? eventAvailability.roles : [],
        comment: eventAvailability.comment || null,
        updatedAt: eventAvailability.updatedAt || new Date()
      }
      
      // Sauvegarder dans la nouvelle structure
      await db.collection('seasons').doc(seasonId)
        .collection('players').doc(playerId)
        .collection('availability').doc(eventId)
        .set(newAvailabilityData)
      
      stats.availabilitiesMigrated++
    }
    
    console.log(`    ✅ ${Object.keys(availabilityData).length} disponibilité(s) migrée(s) pour ${playerName}`)
    
  } catch (error) {
    console.error(`    ❌ Erreur lors de la migration des disponibilités de ${playerName}:`, error.message)
    stats.errors++
  }
}

/**
 * Migrer toutes les sélections d'une saison
 */
async function migrateSeason(seasonId, seasonName) {
  console.log(`\n📅 Migration de la saison: ${seasonName} (${seasonId})`)
  
  try {
    // Récupérer le mapping des joueurs une seule fois pour la saison
    console.log(`  🔍 Récupération du mapping des joueurs...`)
    const playersMapping = await getPlayersMapping(seasonId)
    console.log(`  📊 ${Object.keys(playersMapping).length} joueur(s) trouvé(s) dans la saison`)
    
    // Migrer les disponibilités
    await migrateAvailabilities(seasonId, seasonName, playersMapping)
    
    // Récupérer toutes les sélections de cette saison
    const selectionsSnapshot = await db.collection('seasons').doc(seasonId).collection('selections').get()
    
    if (selectionsSnapshot.empty) {
      console.log(`  ℹ️  Aucune sélection trouvée dans cette saison`)
    } else {
      console.log(`  📊 ${selectionsSnapshot.size} sélection(s) trouvée(s)`)
      
      // Migrer chaque sélection
      for (const selectionDoc of selectionsSnapshot.docs) {
        const eventId = selectionDoc.id
        const selectionData = selectionDoc.data()
        
        await migrateSelection(seasonId, eventId, selectionData, playersMapping)
        stats.eventsProcessed++
      }
    }
    
    stats.seasonsProcessed++
    
  } catch (error) {
    console.error(`❌ Erreur lors de la migration de la saison ${seasonName}:`, error.message)
    stats.errors++
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🔍 Migration des saisons spécifiées...')
    
    // Migrer chaque saison par ID
    for (const seasonId of TARGET_SEASON_IDS) {
      try {
        // Récupérer les données de la saison pour afficher le nom
        const seasonDoc = await db.collection('seasons').doc(seasonId).get()
        if (!seasonDoc.exists) {
          console.log(`⚠️  Saison ${seasonId} non trouvée`)
          continue
        }
        
        const seasonData = seasonDoc.data()
        const seasonName = seasonData.name || seasonData.title || 'Sans nom'
        
        await migrateSeason(seasonId, seasonName)
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de la saison ${seasonId}:`, error.message)
        stats.errors++
      }
    }
    
    // Afficher les statistiques finales
    console.log('\n📊 RÉSULTATS DE LA MIGRATION')
    console.log('========================')
    console.log(`Saisons traitées: ${stats.seasonsProcessed}`)
    console.log(`Événements traités: ${stats.eventsProcessed}`)
    console.log(`Sélections migrées: ${stats.selectionsMigrated}`)
    if (MIGRATE_AVAILABILITIES) {
      console.log(`Disponibilités migrées: ${stats.availabilitiesMigrated}`)
    }
    console.log(`Erreurs: ${stats.errors}`)
    console.log(`Avertissements: ${stats.warnings}`)
    
    console.log('\n✅ Migration terminée avec succès!')
    console.log('📝 Les données originales dans "selections" et "availability" sont préservées')
    console.log('🔄 Pour rejouer le script, supprimez d\'abord les collections "casts" et "players/{id}/availability"')
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Exécuter le script
main()
