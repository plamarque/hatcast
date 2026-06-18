import { describe, expect, it } from 'vitest'

import {
  buildFactorConfig,
  computeProfileSegments,
  defaultEditorState,
  editorStateFromFactorConfig,
  PROFILE_CHART_COLORS,
} from './draw-formula-payload'

describe('draw-formula-payload', () => {
  it('builds stable factor order with silent equity_tag', () => {
    const config = buildFactorConfig(defaultEditorState())
    expect(config.map((entry) => entry.factorId)).toEqual([
      'equity_tag',
      'past_participation',
      'immediate_replay',
      'role_request',
    ])
    expect(config[0]).toEqual({ factorId: 'equity_tag', enabled: true })
  })

  it('maps replay display >= 1.0 to enabled without params', () => {
    const state = defaultEditorState()
    state.immediate_replay.enabled = true
    state.immediate_replay.replayDisplayIntensity = 1.0
    const replay = buildFactorConfig(state).find((entry) => entry.factorId === 'immediate_replay')
    expect(replay).toEqual({
      factorId: 'immediate_replay',
      enabled: true,
    })
  })

  it('maps tuned replay display to MALUS params', () => {
    const state = defaultEditorState()
    state.immediate_replay.enabled = true
    state.immediate_replay.replayDisplayIntensity = 0.75
    const replay = buildFactorConfig(state).find((entry) => entry.factorId === 'immediate_replay')
    expect(replay?.params).toEqual({ mode: 'MALUS', malusMultiplier: 0.25 })
  })

  it('loads editor state from API factorConfig', () => {
    const state = editorStateFromFactorConfig([
      { factorId: 'equity_tag', enabled: true },
      { factorId: 'past_participation', enabled: true, params: { strength: 1.5 } },
      {
        factorId: 'immediate_replay',
        enabled: true,
        params: { mode: 'MALUS', malusMultiplier: 0.5 },
      },
      {
        factorId: 'role_request',
        enabled: true,
        params: { bonusPerUnfulfilled: 1.0, maxBonusMultiplier: 10.0 },
      },
    ])
    expect(state.past_participation.strength).toBe(1.5)
    expect(state.immediate_replay.replayDisplayIntensity).toBe(0.5)
    expect(state.role_request.enabled).toBe(true)
  })

  it('profile chart colors are distinct per criterion', () => {
    expect(PROFILE_CHART_COLORS.past_participation).not.toBe(PROFILE_CHART_COLORS.immediate_replay)
    expect(PROFILE_CHART_COLORS.immediate_replay).not.toBe(PROFILE_CHART_COLORS.role_request)
    expect(PROFILE_CHART_COLORS.past_participation).not.toBe(PROFILE_CHART_COLORS.role_request)
  })

  it('assigns 100% to the only active criterion in the chart', () => {
    const state = defaultEditorState()
    state.immediate_replay.enabled = false
    state.role_request.enabled = false
    const segments = computeProfileSegments(state)
    expect(segments.find((segment) => segment.factorId === 'past_participation')?.percent).toBe(100)
    expect(segments.find((segment) => segment.factorId === 'immediate_replay')?.percent).toBe(0)
    expect(segments.find((segment) => segment.factorId === 'role_request')?.percent).toBe(0)
  })

  it('assigns zero chart weight when intensity is zero', () => {
    const state = defaultEditorState()
    state.past_participation.strength = 0
    state.immediate_replay.enabled = true
    state.immediate_replay.replayDisplayIntensity = 0
    state.role_request.enabled = true
    state.role_request.bonusPerUnfulfilled = 5
    const segments = computeProfileSegments(state)
    expect(segments.find((segment) => segment.factorId === 'past_participation')?.percent).toBe(0)
    expect(segments.find((segment) => segment.factorId === 'immediate_replay')?.percent).toBe(0)
    expect(segments.find((segment) => segment.factorId === 'role_request')?.percent).toBe(100)
  })

  it('profile segments sum to 100 among active criteria only', () => {
    const state = defaultEditorState()
    state.immediate_replay.enabled = true
    state.immediate_replay.replayDisplayIntensity = 0.75
    state.role_request.enabled = true
    const segments = computeProfileSegments(state)
    const activeTotal = segments
      .filter((segment) => segment.enabled)
      .reduce((sum, segment) => sum + segment.percent, 0)
    expect(activeTotal).toBe(100)
  })
})
