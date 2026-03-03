/**
 * Logique pure de calcul des chances et tirage - extraite pour exécution headless
 * Duplique le comportement de chancesService sans dépendances browser (Firebase, etc.)
 */

export function calculateMalus(pastCasts) {
  return 1 / (1 + pastCasts)
}

export function calculateWeightedChances(malus, requiredCount) {
  return malus * requiredCount
}

export function calculateTotalWeight(candidates) {
  return candidates.reduce((total, candidate) => total + candidate.weight, 0)
}

export function groupCandidatesByExperience(candidates) {
  const groups = {}
  for (const candidate of candidates) {
    const experience = candidate.pastSelections || 0
    if (!groups[experience]) groups[experience] = []
    groups[experience].push(candidate)
  }
  return groups
}

export function performWeightedDraw(candidates, role) {
  if (candidates.length === 0) return null
  const totalWeight = calculateTotalWeight(candidates)
  if (totalWeight === 0) return null

  const randomNumber = Math.random() * totalWeight
  let currentWeight = 0
  for (const candidate of candidates) {
    currentWeight += candidate.weight
    if (randomNumber <= currentWeight) return candidate
  }
  return candidates[candidates.length - 1]
}

export function calculateRoleChances(roleData, availablePlayers, countSelections, isAvailableForRole) {
  const { role, requiredCount, eventId, eventType } = roleData

  const candidates = availablePlayers
    .filter(player => isAvailableForRole(player.name, role, eventId))
    .map(player => {
      const pastSelections = countSelections(player.name, role, null, eventType)
      const malus = calculateMalus(pastSelections)
      const weightedChances = calculateWeightedChances(malus, requiredCount)
      return {
        name: player.name,
        id: player.id,
        pastSelections,
        weight: weightedChances,
        malus,
        weightedChances,
        requiredCount
      }
    })

  return {
    role,
    requiredCount,
    candidates,
    totalWeight: calculateTotalWeight(candidates),
    availableCount: candidates.length
  }
}
