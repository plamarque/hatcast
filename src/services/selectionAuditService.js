import { default as AuditClient } from './auditClient.js'

/**
 * Service d'audit spécialisé pour les opérations de sélection
 * Centralise tous les logs d'audit liés aux compositions d'équipe
 */

/**
 * Logger une confirmation de statut de joueur
 */
export async function logPlayerStatusChange({ playerName, eventId, eventTitle, seasonSlug, oldStatus, newStatus, source = 'unknown' }) {
  try {
    const action = getStatusChangeAction(newStatus)
    const severity = getStatusChangeSeverity(newStatus)
    
    await AuditClient.logUserAction({
      type: action,
      category: 'player_status',
      severity,
      data: {
        playerName,
        eventId,
        eventTitle,
        seasonSlug,
        oldStatus,
        newStatus,
        source, // 'selection_modal', 'event_modal', 'magic_link', etc.
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['player_status', 'confirmation', source]
    })
  } catch (error) {
    console.warn('Erreur audit changement statut joueur:', error)
  }
}

/**
 * Logger une validation/déverrouillage de composition
 */
export async function logCastValidation({ eventId, eventTitle, seasonSlug, action, source = 'unknown' }) {
  try {
    const severity = action === 'validate' ? 'info' : 'warning'
    
    await AuditClient.logUserAction({
      type: `cast_${action}`,
      category: 'cast_management',
      severity,
      data: {
        eventId,
        eventTitle,
        seasonSlug,
        action,
        source,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['cast_management', action, source]
    })
  } catch (error) {
    console.warn('Erreur audit validation composition:', error)
  }
}

/**
 * Logger une composition automatique
 */
export async function logAutoSelection({ eventId, eventTitle, seasonSlug, oldComposition, newComposition, source = 'unknown' }) {
  try {
    const addedPlayers = getAddedPlayers(oldComposition, newComposition)
    const removedPlayers = getRemovedPlayers(oldComposition, newComposition)
    
    await AuditClient.logUserAction({
      type: 'auto_selection',
      category: 'selection',
      severity: 'info',
      data: {
        eventId,
        eventTitle,
        seasonSlug,
        oldComposition: formatComposition(oldComposition),
        newComposition: formatComposition(newComposition),
        addedPlayers,
        removedPlayers,
        source,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['selection', 'auto', source]
    })
  } catch (error) {
    console.warn('Erreur audit composition auto:', error)
  }
}

/**
 * Logger une complétion de composition
 */
export async function logCastCompletion({ eventId, eventTitle, seasonSlug, addedPlayer, role, source = 'unknown' }) {
  try {
    await AuditClient.logUserAction({
      type: 'cast_completion',
      category: 'selection',
      severity: 'info',
      data: {
        eventId,
        eventTitle,
        seasonSlug,
        addedPlayer,
        role,
        source,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['selection', 'completion', source]
    })
  } catch (error) {
    console.warn('Erreur audit complétion composition:', error)
  }
}

/**
 * Logger une suppression manuelle de composition
 */
export async function logManualDeselection({ eventId, eventTitle, seasonSlug, removedPlayer, role, source = 'unknown' }) {
  try {
    await AuditClient.logUserAction({
      type: 'manual_deselection',
      category: 'selection',
      severity: 'info',
      data: {
        eventId,
        eventTitle,
        seasonSlug,
        removedPlayer,
        role,
        source,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['selection', 'manual', 'deselection', source]
    })
  } catch (error) {
    console.warn('Erreur audit suppression manuelle:', error)
  }
}

/**
 * Logger une sélection manuelle
 */
export async function logManualSelection({ eventId, eventTitle, seasonSlug, selectedPlayer, role, source = 'unknown' }) {
  try {
    await AuditClient.logUserAction({
      type: 'manual_selection',
      category: 'selection',
      severity: 'info',
      data: {
        eventId,
        eventTitle,
        seasonSlug,
        selectedPlayer,
        role,
        source,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['selection', 'manual', 'selection', source]
    })
  } catch (error) {
    console.warn('Erreur audit sélection manuelle:', error)
  }
}

// === FONCTIONS UTILITAIRES ===

function getStatusChangeAction(newStatus) {
  switch (newStatus) {
    case 'confirmed': return 'player_confirmed'
    case 'declined': return 'player_declined'
    case 'pending': return 'player_pending'
    default: return 'player_status_changed'
  }
}

function getStatusChangeSeverity(newStatus) {
  switch (newStatus) {
    case 'confirmed': return 'info'
    case 'declined': return 'warning'
    case 'pending': return 'info'
    default: return 'info'
  }
}

function getAddedPlayers(oldComp, newComp) {
  const oldPlayers = extractAllPlayers(oldComp)
  const newPlayers = extractAllPlayers(newComp)
  return newPlayers.filter(player => !oldPlayers.includes(player))
}

function getRemovedPlayers(oldComp, newComp) {
  const oldPlayers = extractAllPlayers(oldComp)
  const newPlayers = extractAllPlayers(newComp)
  return oldPlayers.filter(player => !newPlayers.includes(player))
}

function extractAllPlayers(composition) {
  if (!composition || !composition.roles) return []
  return Object.values(composition.roles).flat().filter(Boolean)
}

function formatComposition(composition) {
  if (!composition || !composition.roles) return {}
  const formatted = {}
  Object.entries(composition.roles).forEach(([role, players]) => {
    if (players && players.length > 0) {
      formatted[role] = players
    }
  })
  return formatted
}
