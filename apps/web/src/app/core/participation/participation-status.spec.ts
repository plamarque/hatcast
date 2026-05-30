import {
  participationBadgeModifier,
  participationChartModifier,
  participationSlotRowModifier,
  participationTokenPrefix,
  resolveParticipationChartStatus,
} from './participation-status'

describe('resolveParticipationChartStatus', () => {
  it('maps legacy available with roleKey to selected', () => {
    expect(resolveParticipationChartStatus('available', 'player')).toBe('selected')
  })

  it('keeps available without roleKey', () => {
    expect(resolveParticipationChartStatus('available')).toBe('available')
  })

  it('passes through known statuses', () => {
    expect(resolveParticipationChartStatus('pending', 'player')).toBe('pending')
    expect(resolveParticipationChartStatus('declined', 'player')).toBe('declined')
  })

  it('falls back to neutral for unknown status', () => {
    expect(resolveParticipationChartStatus('legacy')).toBe('neutral')
  })
})

describe('participationChartModifier', () => {
  it('maps chart statuses to BEM modifiers', () => {
    expect(participationChartModifier('available')).toBe('--available')
    expect(participationChartModifier('selected')).toBe('--selected')
    expect(participationChartModifier('pending')).toBe('--pending')
    expect(participationChartModifier('declined')).toBe('--declined')
    expect(participationChartModifier('unavailable')).toBe('--unavailable')
    expect(participationChartModifier('neutral')).toBe('--neutral')
  })
})

describe('participationBadgeModifier', () => {
  it('delegates availability statuses', () => {
    expect(participationBadgeModifier('available')).toBe('--available')
    expect(participationBadgeModifier('unavailable')).toBe('--unavailable')
    expect(participationBadgeModifier('unknown')).toBe('--unknown')
  })

  it('maps in-team and selected to the same modifier', () => {
    expect(participationBadgeModifier('in-team')).toBe('--selected')
    expect(participationBadgeModifier('selected')).toBe('--selected')
  })

  it('maps declined', () => {
    expect(participationBadgeModifier('declined')).toBe('--declined')
  })
})

describe('participationSlotRowModifier', () => {
  it('maps slot participation to row modifiers', () => {
    expect(participationSlotRowModifier('confirmed')).toBe('--selected')
    expect(participationSlotRowModifier('pending')).toBe('--pending')
    expect(participationSlotRowModifier('declined')).toBe('--declined')
    expect(participationSlotRowModifier(null)).toBeNull()
    expect(participationSlotRowModifier(undefined)).toBeNull()
  })
})

describe('participationTokenPrefix', () => {
  it('returns CSS variable family prefix', () => {
    expect(participationTokenPrefix('selected')).toBe('--hatcast-participation-selected')
    expect(participationTokenPrefix('pending')).toBe('--hatcast-participation-pending')
    expect(participationTokenPrefix('declined')).toBe('--hatcast-participation-declined')
  })
})
