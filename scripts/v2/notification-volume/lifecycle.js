/**
 * Minimal port of CompositionLifecycleService (Kotlin) for replay simulation.
 */

/** @typedef {'PREPARING'|'DRAFT_COMPOSITION'|'GAPS_TO_FILL'|'AWAITING_CONFIRMATIONS'|'COMPLETE'} CompositionLifecycle */

/**
 * @param {Record<string, number>} roleSlots
 * @returns {Record<string, number>}
 */
export function normalizeRoleSlots(roleSlots) {
  const out = {}
  for (const [key, count] of Object.entries(roleSlots || {})) {
    const n = Number(count)
    if (Number.isFinite(n) && n > 0) out[key] = Math.floor(n)
  }
  return out
}

/**
 * @param {Record<string, number>} roleSlots
 * @returns {Array<[string, number]>}
 */
export function requiredPositions(roleSlots) {
  const normalized = normalizeRoleSlots(roleSlots)
  return Object.entries(normalized).flatMap(([role, count]) =>
    Array.from({ length: count }, (_, index) => [role, index]),
  )
}

/**
 * @param {{ participantId: string|null, participationStatus: string, waived: boolean }} row
 */
function isEffectivelyFilled(row) {
  return row.participantId != null && row.participationStatus !== 'DECLINED'
}

/**
 * @param {{ validatedAt: string|null, publishedAt?: string|null }|null} composition
 * @param {Array<{ roleKey: string, slotIndex: number, participantId: string|null, participationStatus: string, waived: boolean }>} slots
 * @param {Record<string, number>} roleSlots
 * @returns {CompositionLifecycle}
 */
export function computeRawLifecycle(composition, slots, roleSlots) {
  const assignedCount = slots.filter((s) => s.participantId != null).length
  if (!composition) return 'PREPARING'
  if (assignedCount === 0) {
    return composition.validatedAt != null ? 'GAPS_TO_FILL' : 'PREPARING'
  }
  if (composition.validatedAt == null) return 'DRAFT_COMPOSITION'
  const byPos = new Map(slots.map((s) => [`${s.roleKey}:${s.slotIndex}`, s]))
  const hasEmpty = requiredPositions(roleSlots).some(([role, index]) => {
    const row = byPos.get(`${role}:${index}`)
    return row == null || !isEffectivelyFilled(row)
  })
  if (hasEmpty) return 'GAPS_TO_FILL'
  const allComplete = requiredPositions(roleSlots).every(([role, index]) => {
    const row = byPos.get(`${role}:${index}`)
    if (!row || !isEffectivelyFilled(row)) return false
    return row.waived || row.participationStatus === 'CONFIRMED'
  })
  return allComplete ? 'COMPLETE' : 'AWAITING_CONFIRMATIONS'
}

/**
 * @param {Record<string, string>} playerStatuses
 * @param {boolean} [organizerConfirmed]
 * @param {string|null|undefined} confirmedAt
 * @param {string|null|undefined} updatedAt
 */
export function mapCompositionLifecycle(status, confirmedAt, updatedAt, organizerConfirmed) {
  const at = confirmedAt || updatedAt || new Date().toISOString()
  if (organizerConfirmed === true) {
    return { validatedAt: at, publishedAt: at }
  }
  switch (status) {
    case 'confirmed':
      return { validatedAt: at, publishedAt: at }
    case 'pending_confirmation':
      return { validatedAt: at, publishedAt: null }
    case 'incomplete':
    default:
      return { validatedAt: null, publishedAt: null }
  }
}

/**
 * @param {string|null|undefined} v1Status
 */
export function mapParticipationStatus(v1Status) {
  const map = { confirmed: 'CONFIRMED', declined: 'DECLINED', pending: 'PENDING' }
  return map[String(v1Status || '').trim()] || 'PENDING'
}
