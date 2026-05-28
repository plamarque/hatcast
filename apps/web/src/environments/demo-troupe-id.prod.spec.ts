import { describe, expect, it } from 'vitest'

import { DEMO_TROUPE_ID } from '../app/core/troupes/demo-troupe.constants'
import { environment } from './environment'

const improbotsUuid = 'a0000001-0000-4000-8000-000000000001'

describe('prod demo troupe id', () => {
  it('environment.ts cible Démo …000099, pas Les Improbots …000001', () => {
    expect(environment.demoTroupeId).toBe(DEMO_TROUPE_ID)
    expect(environment.demoTroupeId).not.toBe(improbotsUuid)
  })
})
