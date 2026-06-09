import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildInAppSkippedSteps,
  buildInAppSteps,
  buildReportFilename,
  parseCliArgs,
} from './profile-web-performance.mjs'

describe('profile-web-performance CLI helpers', () => {
  it('parses --in-app flag', () => {
    assert.deepEqual(parseCliArgs([]), { inApp: false })
    assert.deepEqual(parseCliArgs(['--in-app']), { inApp: true })
    assert.deepEqual(parseCliArgs(['--verbose', '--in-app']), { inApp: true })
  })

  it('builds distinct report filenames per mode', () => {
    const now = new Date('2026-06-10T12:34:56.789Z')
    assert.match(buildReportFilename('goto', now), /^web-perf-2026-06-10T12-34-56-789Z\.json$/)
    assert.match(
      buildReportFilename('in-app', now),
      /^web-perf-inapp-2026-06-10T12-34-56-789Z\.json$/,
    )
  })

  it('builds in-app navigation steps for high-traffic pages', () => {
    const steps = buildInAppSteps({
      troupeSlug: 'improbots',
      seasonSlug: 'saison-2026',
      eventSlug: 'cabaret',
      eventTitle: 'Cabaret',
    })

    assert.deepEqual(
      steps.map((step) => step.label),
      ['Accueil todo', 'Agenda membre', 'Event Infos', 'Event Dispos', 'Event Équipe'],
    )
    assert.match(steps[2].url, /tab=infos$/)
    assert.match(steps[3].url, /tab=dispos$/)
    assert.match(steps[4].url, /tab=equipe$/)
  })

  it('omits event steps when no upcoming event', () => {
    const steps = buildInAppSteps({
      troupeSlug: 'improbots',
      seasonSlug: 'saison-2026',
      eventSlug: null,
    })

    assert.deepEqual(steps.map((step) => step.label), ['Accueil todo', 'Agenda membre'])
  })

  it('reports skipped event steps when no upcoming event', () => {
    const skipped = buildInAppSkippedSteps({
      troupeSlug: 'improbots',
      seasonSlug: 'saison-2026',
      eventSlug: null,
    })

    assert.equal(skipped.length, 1)
    assert.match(skipped[0].reason, /me\/agenda/)
    assert.deepEqual(skipped[0].labels, ['Event Infos', 'Event Dispos', 'Event Équipe'])
  })
})
