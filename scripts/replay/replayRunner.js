/**
 * Logique de replay des tirages - utilise les algorithmes existants sans les modifier
 * Utilise chancesLogic (copie headless) pour éviter les dépendances browser
 */

import {
  calculateRoleChances,
  performWeightedDraw,
  groupCandidatesByExperience
} from './chancesLogic.js'

// Copie de ROLE_PRIORITY_ORDER pour éviter d'importer storage (dépendances browser)
const ROLE_PRIORITY_ORDER = [
  'referee',
  'dj',
  'mc',
  'player',
  'assistant_referee',
  'coach',
  'stage_manager',
  'lighting',
  'volunteer'
]

/**
 * Vérifie si un joueur est disponible pour un rôle
 * @param {string} playerName
 * @param {string} role
 * @param {string} eventId
 * @param {Object} availability - { [playerName]: { [eventId]: { available, roles } } }
 */
export function isAvailableForRole(playerName, role, eventId, availability) {
  const availabilityData = availability?.[playerName]?.[eventId]

  if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
    if (availabilityData.available && availabilityData.roles) {
      if (availabilityData.roles.includes(role)) return true
      if (availabilityData.roles.length === 0) return true
    }
    return false
  }

  if (role === 'player') {
    return availabilityData === true
  }

  return false
}

/**
 * Construit une fonction countSelections basée sur les casts simulés
 * @param {Object} simulatedCasts - { [eventId]: { roles: { [role]: [playerIds] } } }
 * @param {Array} events - événements ordonnés
 * @param {Array} players - liste des joueurs
 */
export function buildCountSelections(simulatedCasts, events, players) {
  const eventMap = new Map(events.map(e => [e.id, e]))
  const playerByName = new Map(players.map(p => [p.name, p]))

  return function countSelections(playerName, role = 'player', excludeEventId = null, currentEventType = null) {
    const player = playerByName.get(playerName)
    if (!player) return 0

    return Object.keys(simulatedCasts).filter(eventId => {
      if (excludeEventId && eventId === excludeEventId) return false

      const event = eventMap.get(eventId)
      if (!event || event.archived === true) return false

      const cast = simulatedCasts[eventId]
      if (!cast) return false

      if (currentEventType) {
        const eventType = event.templateType || 'custom'
        if (currentEventType === 'deplacement') {
          if (eventType !== 'deplacement') return false
        } else {
          if (eventType === 'deplacement') return false
        }
      }

      if (cast.roles && cast.roles[role]) {
        return cast.roles[role].includes(player.id)
      }

      if (role === 'player' && Array.isArray(cast)) {
        return cast.includes(player.id)
      }

      return false
    }).length
  }
}

/**
 * Construit une fonction qui retourne les joueurs ayant joué un rôle à l'événement précédent (même type)
 * @param {Object} simulatedCasts - { [eventId]: { roles: { [role]: [playerIds] } } }
 * @param {Array} events - événements ordonnés chronologiquement
 * @returns {Function} (eventId, role, eventType) => Set<playerId>
 */
export function buildGetPreviousEventPlayers(simulatedCasts, events) {
  const eventIndexById = new Map(events.map((e, i) => [e.id, i]))

  return function getPreviousEventPlayers(eventId, role, eventType) {
    const idx = eventIndexById.get(eventId)
    if (idx == null || idx === 0) return new Set()

    const isDeplacement = eventType === 'deplacement'
    for (let i = idx - 1; i >= 0; i--) {
      const prevEvent = events[i]
      const prevType = prevEvent.templateType || 'custom'
      const prevIsDeplacement = prevType === 'deplacement'
      if (prevIsDeplacement !== isDeplacement) continue

      const cast = simulatedCasts[prevEvent.id]
      if (!cast?.roles?.[role]) continue
      return new Set(cast.roles[role])
    }
    return new Set()
  }
}

/**
 * Effectue un tirage pour un rôle avec l'algorithme spécifié
 * @param {string} algorithm - 'default', 'bruno' ou 'bruno2'
 * @param {Object} roleData - { role, requiredCount, eventId, eventType }
 * @param {Array} candidates - joueurs disponibles (avec name, id)
 * @param {Function} countSelections
 * @param {Function} isAvailableForRole
 * @param {Array} alreadySelectedNames - noms déjà sélectionnés pour cet événement
 * @param {Function} [getPreviousEventPlayers] - (eventId, role, eventType) => Set<playerId> ; requis pour bruno2
 * @returns {Array} - noms des joueurs sélectionnés
 */
function drawForRole(algorithm, roleData, candidates, countSelections, isAvailableForRole, alreadySelectedNames = [], getPreviousEventPlayers = null) {
  const { role, requiredCount, eventId, eventType } = roleData

  const availableCandidates = candidates.filter(
    p => isAvailableForRole(p.name, role, eventId) && !alreadySelectedNames.includes(p.name)
  )

  if (availableCandidates.length === 0) return []

  const isBruno = algorithm === 'bruno'
  const isBruno2 = algorithm === 'bruno2'
  const roleDataFull = { role, requiredCount, eventId, eventType }
  const roleChances = isBruno || isBruno2
    ? calculateRoleChances(roleDataFull, availableCandidates, countSelections, (name, r, eid) =>
        isAvailableForRole(name, r, eid) && !alreadySelectedNames.includes(name)
      )
    : calculateRoleChances(roleDataFull, availableCandidates, countSelections, (name, r, eid) =>
        isAvailableForRole(name, r, eid) && !alreadySelectedNames.includes(name)
      )

  const candidatesList = roleChances.candidates || []
  if (candidatesList.length === 0) return []

  if (isBruno2) {
    const previousPlayerIds = getPreviousEventPlayers ? getPreviousEventPlayers(eventId, role, eventType) : new Set()
    const preferred = candidatesList.filter(c => !previousPlayerIds.has(c.id))
    const fallback = candidatesList.filter(c => previousPlayerIds.has(c.id))

    const selected = []
    let pool = [...preferred]

    while (selected.length < requiredCount && pool.length > 0) {
      const drawn = performWeightedDraw(pool, role, {})
      if (!drawn) break
      selected.push(drawn.name)
      pool = pool.filter(c => c.name !== drawn.name)
    }

    if (selected.length < requiredCount && fallback.length > 0) {
      pool = [...fallback].filter(c => !selected.includes(c.name))
      while (selected.length < requiredCount && pool.length > 0) {
        const drawn = performWeightedDraw(pool, role, {})
        if (!drawn) break
        selected.push(drawn.name)
        pool = pool.filter(c => c.name !== drawn.name)
      }
    }

    return selected
  }

  const selected = []
  let pool = [...candidatesList]

  for (let i = 0; i < requiredCount && pool.length > 0; i++) {
    let candidatesToDrawFrom = pool

    if (isBruno) {
      const byExp = groupCandidatesByExperience(pool)
      const levels = Object.keys(byExp).map(Number).sort((a, b) => a - b)
      const minLevel = levels[0]
      candidatesToDrawFrom = byExp[minLevel] || pool
    }

    const drawn = performWeightedDraw(candidatesToDrawFrom, role, {})
    if (!drawn) break

    selected.push(drawn.name)
    pool = pool.filter(c => c.name !== drawn.name)
  }

  return selected
}

/**
 * Rejoue une saison avec l'algorithme spécifié
 * @param {Array} events - événements ordonnés chronologiquement
 * @param {Array} players - joueurs
 * @param {Object} availability - disponibilités
 * @param {Object} realCasts - casts réels ; le premier événement utilise ce cast (tirage commun pour tous les algos)
 * @param {string} algorithm - 'default', 'bruno' ou 'bruno2'
 * @returns {Object} - simulatedCasts { [eventId]: { roles: { [role]: [playerIds] } } }
 */
export function runReplayForAlgorithm(events, players, availability, realCasts, algorithm) {
  const simulatedCasts = {}
  const isAvailable = (name, role, eventId) => isAvailableForRole(name, role, eventId, availability)

  const firstEvent = events[0]
  if (firstEvent && realCasts[firstEvent.id]?.roles) {
    simulatedCasts[firstEvent.id] = {
      roles: JSON.parse(JSON.stringify(realCasts[firstEvent.id].roles)),
      confirmed: true
    }
  }

  const getPreviousEventPlayers = buildGetPreviousEventPlayers(simulatedCasts, events)

  for (const event of events) {
    if (simulatedCasts[event.id]) continue
    const eventId = event.id
    const roles = event.roles || { player: event.playerCount || 6 }
    const eventType = event.templateType || 'custom'

    const newSelections = {}
    const allAlreadySelected = []

    for (const role of ROLE_PRIORITY_ORDER) {
      const requiredCount = roles[role] || 0
      if (requiredCount <= 0) continue

      const countSelections = buildCountSelections(simulatedCasts, events, players)
      const roleData = { role, requiredCount, eventId, eventType }

      const alreadySelectedNames = Object.values(newSelections).flat().map(pid => {
        const p = players.find(pl => pl.id === pid)
        return p ? p.name : null
      }).filter(Boolean)

      const selectedNames = drawForRole(
        algorithm,
        roleData,
        players,
        countSelections,
        isAvailable,
        alreadySelectedNames,
        getPreviousEventPlayers
      )

      const selectedIds = selectedNames.map(name => {
        const p = players.find(pl => pl.name === name)
        return p ? p.id : name
      })

      newSelections[role] = selectedIds
      allAlreadySelected.push(...selectedIds)
    }

    simulatedCasts[eventId] = {
      roles: newSelections,
      confirmed: true
    }
  }

  return simulatedCasts
}
