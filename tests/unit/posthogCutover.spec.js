import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  buildV2CutoverUrl,
  captureCutoverEvent,
  isCutoverModalEnabled,
  isPostHogCutoverEnabled,
  resetPostHogCutoverForTests,
  V1_CUTOVER_CTA_CLICKED,
  V1_CUTOVER_MODAL_DISMISSED,
  V1_CUTOVER_MODAL_SHOWN,
  V1_CUTOVER_SRC,
} from '../../src/services/posthogCutover.js'

describe('posthogCutover', () => {
  const env = { ...import.meta.env }

  beforeEach(() => {
    resetPostHogCutoverForTests()
    import.meta.env.VITE_V2_CUTOVER_MODAL_ENABLED = 'false'
    import.meta.env.VITE_POSTHOG_PROJECT_API_KEY = ''
  })

  afterEach(() => {
    Object.assign(import.meta.env, env)
    resetPostHogCutoverForTests()
  })

  it('buildV2CutoverUrl encodes ph_ref and src', () => {
    const url = buildV2CutoverUrl('anon-id/with+special')
    expect(url).toBe(
      'https://hatcast.app/?src=v1_cutover&ph_ref=anon-id%2Fwith%2Bspecial',
    )
  })

  it('buildV2CutoverUrl without ph_ref still includes src', () => {
    const url = buildV2CutoverUrl(null)
    expect(url).toBe('https://hatcast.app/?src=v1_cutover')
  })

  it('isCutoverModalEnabled is true only when flag is true', () => {
    import.meta.env.VITE_V2_CUTOVER_MODAL_ENABLED = 'true'
    expect(isCutoverModalEnabled()).toBe(true)
    import.meta.env.VITE_V2_CUTOVER_MODAL_ENABLED = 'false'
    expect(isCutoverModalEnabled()).toBe(false)
  })

  it('isPostHogCutoverEnabled is false when key empty', () => {
    import.meta.env.VITE_POSTHOG_PROJECT_API_KEY = ''
    expect(isPostHogCutoverEnabled()).toBe(false)
    import.meta.env.VITE_POSTHOG_PROJECT_API_KEY = '   '
    expect(isPostHogCutoverEnabled()).toBe(false)
  })

  it('isPostHogCutoverEnabled is true when key set', () => {
    import.meta.env.VITE_POSTHOG_PROJECT_API_KEY = 'phc_test'
    expect(isPostHogCutoverEnabled()).toBe(true)
  })

  it('captureCutoverEvent is no-op without init', () => {
    expect(() => captureCutoverEvent(V1_CUTOVER_MODAL_SHOWN)).not.toThrow()
    expect(() =>
      captureCutoverEvent(V1_CUTOVER_CTA_CLICKED, { src: V1_CUTOVER_SRC }),
    ).not.toThrow()
    expect(() => captureCutoverEvent(V1_CUTOVER_MODAL_DISMISSED)).not.toThrow()
  })
})
