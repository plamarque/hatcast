export function replayDisplayFromParams(
  mode: string | undefined,
  malusMultiplier: number | undefined,
): number {
  if (mode === 'EXCLUDE' || mode == null) {
    return 1.0
  }
  if (mode === 'MALUS') {
    const mult = malusMultiplier ?? 0.25
    return roundDisplay(1 - mult)
  }
  return 1.0
}

export function replayParamsFromDisplay(displayIntensity: number): {
  mode: 'EXCLUDE' | 'MALUS'
  malusMultiplier?: number
} {
  if (displayIntensity >= 1.0) {
    return { mode: 'EXCLUDE' }
  }
  return {
    mode: 'MALUS',
    malusMultiplier: roundMultiplier(1 - displayIntensity),
  }
}

function roundDisplay(value: number): number {
  return Math.round(value * 100) / 100
}

function roundMultiplier(value: number): number {
  return Math.round(value * 100) / 100
}
