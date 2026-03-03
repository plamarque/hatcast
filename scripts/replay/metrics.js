/**
 * Calcul des métriques pour comparer les algorithmes de tirage
 */

/**
 * Compte le nombre de joueurs qui jouent à deux spectacles consécutifs
 * @param {Object} castsByEventId - { [eventId]: { roles: { [role]: [playerIds] } } }
 * @param {Array} eventsOrdered - événements ordonnés chronologiquement
 * @param {Array} players - liste des joueurs (pour résoudre les IDs en noms si besoin)
 * @returns {number}
 */
export function computeConsecutivePlays(castsByEventId, eventsOrdered, players = []) {
  let count = 0
  const playerIdsInEvent = (cast) => {
    if (!cast?.roles) return new Set()
    return new Set(Object.values(cast.roles).flat().filter(Boolean))
  }

  for (let i = 0; i < eventsOrdered.length - 1; i++) {
    const eventA = eventsOrdered[i]
    const eventB = eventsOrdered[i + 1]
    const castA = castsByEventId[eventA.id]
    const castB = castsByEventId[eventB.id]

    if (!castA || !castB) continue

    const playersA = playerIdsInEvent(castA)
    const playersB = playerIdsInEvent(castB)

    for (const playerId of playersA) {
      if (playersB.has(playerId)) count++
    }
  }

  return count
}

/**
 * Calcule l'écart-type des participations par joueur
 * @param {Object} castsByEventId
 * @param {Array} players
 * @returns {number}
 */
export function computeParticipationStdDev(castsByEventId, players) {
  const participations = computeParticipationCount(castsByEventId, players)
  const values = Object.values(participations)
  if (values.length === 0) return 0

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Compte le nombre de paires (A, B) distinctes ayant joué ensemble
 * @param {Object} castsByEventId
 * @returns {number}
 */
export function computeUniquePairs(castsByEventId) {
  const pairs = new Set()

  for (const cast of Object.values(castsByEventId)) {
    if (!cast?.roles) continue
    const allPlayerIds = [...new Set(Object.values(cast.roles).flat().filter(Boolean))]
    for (let i = 0; i < allPlayerIds.length; i++) {
      for (let j = i + 1; j < allPlayerIds.length; j++) {
        const a = allPlayerIds[i]
        const b = allPlayerIds[j]
        pairs.add(a < b ? `${a}-${b}` : `${b}-${a}`)
      }
    }
  }

  return pairs.size
}

/**
 * Compte les participations par joueur
 * @param {Object} castsByEventId
 * @param {Array} players
 * @returns {Object} - { [playerName]: count }
 */
export function computeParticipationCount(castsByEventId, players) {
  const count = {}
  const playerById = new Map(players.map(p => [p.id, p]))

  for (const p of players) {
    count[p.name] = 0
  }

  for (const cast of Object.values(castsByEventId)) {
    if (!cast?.roles) continue
    const seen = new Set()
    for (const playerIds of Object.values(cast.roles)) {
      for (const id of (playerIds || [])) {
        if (seen.has(id)) continue
        seen.add(id)
        const player = playerById.get(id)
        if (player && count[player.name] !== undefined) {
          count[player.name]++
        }
      }
    }
  }

  return count
}

/**
 * Calcule toutes les métriques pour un ensemble de casts
 * @param {Object} castsByEventId
 * @param {Array} eventsOrdered
 * @param {Array} players
 * @returns {Object}
 */
export function computeAllMetrics(castsByEventId, eventsOrdered, players) {
  return {
    consecutivePlays: computeConsecutivePlays(castsByEventId, eventsOrdered, players),
    participationStdDev: computeParticipationStdDev(castsByEventId, players),
    uniquePairs: computeUniquePairs(castsByEventId),
    perPlayerParticipations: computeParticipationCount(castsByEventId, players)
  }
}
