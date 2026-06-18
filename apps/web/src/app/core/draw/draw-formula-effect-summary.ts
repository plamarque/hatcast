/** Illustrative baseline for F2-E examples (not a real draw %). */
export const BASE_CHANCE_EXAMPLE_PCT = 20

function formatMultiplier(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  return rounded.toLocaleString('fr-FR', { maximumFractionDigits: 3 })
}

function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return `${rounded.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`
}

function formatPointDelta(basePct: number, resultPct: number): string {
  const delta = Math.round((resultPct - basePct) * 10) / 10
  if (delta === 0) {
    return '0 pt'
  }
  const sign = delta > 0 ? '+' : '−'
  const magnitude = Math.abs(delta).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
  return `${sign}${magnitude} pt`
}

function exampleChanceLine(multiplier: number): string {
  const resultPct = BASE_CHANCE_EXAMPLE_PCT * multiplier
  return `${formatPercent(resultPct)} (${formatPointDelta(BASE_CHANCE_EXAMPLE_PCT, resultPct)})`
}

function exampleBaseIntro(): string {
  return `Exemple avec ${formatPercent(BASE_CHANCE_EXAMPLE_PCT)} de base :`
}

export function pastParticipationEffectSummary(strength: number): string {
  if (strength === 0) {
    return (
      'Chaque participation passée de plus réduit la cote. Intensité 0 : aucun effet. ' +
      `${exampleBaseIntro()} reste ${formatPercent(BASE_CHANCE_EXAMPLE_PCT)} (${formatPointDelta(BASE_CHANCE_EXAMPLE_PCT, BASE_CHANCE_EXAMPLE_PCT)}).`
    )
  }

  const oneMult = Math.pow(0.5, strength)
  const threeMult = Math.pow(0.25, strength)
  return (
    `Chaque participation passée de plus réduit la cote. Intensité ${formatMultiplier(strength)} : ` +
    `1 participation → cote × ${formatMultiplier(oneMult)} · ` +
    `3 participations → cote × ${formatMultiplier(threeMult)}. ` +
    `${exampleBaseIntro()} 1 participation → ${exampleChanceLine(oneMult)} · ` +
    `3 participations → ${exampleChanceLine(threeMult)}.`
  )
}

export function immediateReplayEffectSummary(displayIntensity: number): string {
  if (displayIntensity >= 1.0) {
    return (
      'Si rejeu au spectacle précédent (même catégorie) : exclue du tirage (cote nulle). ' +
      `${exampleBaseIntro()} ${formatPercent(0)} (${formatPointDelta(BASE_CHANCE_EXAMPLE_PCT, 0)}).`
    )
  }
  if (displayIntensity <= 0) {
    return (
      'Si rejeu immédiat : aucune pénalité (cote × 1). ' +
      `${exampleBaseIntro()} reste ${formatPercent(BASE_CHANCE_EXAMPLE_PCT)} (${formatPointDelta(BASE_CHANCE_EXAMPLE_PCT, BASE_CHANCE_EXAMPLE_PCT)}).`
    )
  }

  const multiplier = 1 - displayIntensity
  const intensity = formatMultiplier(displayIntensity)
  return (
    `Si rejeu immédiat : cote × ${formatMultiplier(multiplier)}. Intensité du malus ${intensity}. ` +
    `${exampleBaseIntro()} ${formatPercent(BASE_CHANCE_EXAMPLE_PCT)} → ${exampleChanceLine(multiplier)}.`
  )
}

export function roleRequestEffectSummary(
  bonusPerUnfulfilled: number,
  maxBonusMultiplier: number,
): string {
  if (bonusPerUnfulfilled === 0) {
    return (
      'Chaque demande passée non satisfaite augmente la cote. Intensité 0 : aucun effet. ' +
      `${exampleBaseIntro()} reste ${formatPercent(BASE_CHANCE_EXAMPLE_PCT)} (${formatPointDelta(BASE_CHANCE_EXAMPLE_PCT, BASE_CHANCE_EXAMPLE_PCT)}).`
    )
  }

  const oneMult = 1 + bonusPerUnfulfilled
  const threeMult = Math.min(1 + 3 * bonusPerUnfulfilled, maxBonusMultiplier)
  const cap = formatMultiplier(maxBonusMultiplier)
  const bonus = formatMultiplier(bonusPerUnfulfilled)

  return (
    `Chaque demande passée non satisfaite augmente la cote : ` +
    `1 demande → ×${formatMultiplier(oneMult)} · ` +
    `3 demandes → ×${formatMultiplier(threeMult)} (bonus ${bonus} par demande). ` +
    `Plafond total : ×${cap}. ` +
    `${exampleBaseIntro()} 1 demande → ${exampleChanceLine(oneMult)} · ` +
    `3 demandes → ${exampleChanceLine(threeMult)}.`
  )
}
