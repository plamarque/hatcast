import { describe, expect, it } from 'vitest'

import {
  IDP_SIGNUP_RETRY_BACKOFF_MS,
  IDP_SIGNUP_RETRY_MAX_ATTEMPTS,
  isTransientIdpFailure,
} from './idp-transient-retry'

describe('idp-transient-retry', () => {
  it('isTransientIdpFailure matches 0, 500, 503 only', () => {
    expect(isTransientIdpFailure(0)).toBe(true)
    expect(isTransientIdpFailure(500)).toBe(true)
    expect(isTransientIdpFailure(503)).toBe(true)
    expect(isTransientIdpFailure(401)).toBe(false)
    expect(isTransientIdpFailure(403)).toBe(false)
    expect(isTransientIdpFailure(409)).toBe(false)
    expect(isTransientIdpFailure(200)).toBe(false)
  })

  it('documents signup retry constants', () => {
    expect(IDP_SIGNUP_RETRY_MAX_ATTEMPTS).toBe(3)
    expect(IDP_SIGNUP_RETRY_BACKOFF_MS).toEqual([300, 900])
  })
})
