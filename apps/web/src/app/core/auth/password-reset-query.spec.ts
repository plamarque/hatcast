import { describe, expect, it } from 'vitest'

import { parsePasswordResetQuery } from './password-reset-query'

describe('parsePasswordResetQuery', () => {
  it('extrait oobCode et mode depuis une query avec ?', () => {
    const q =
      '?mode=resetPassword&oobCode=abc&lang=fr'
    expect(parsePasswordResetQuery(q)).toEqual({
      oobCode: 'abc',
      mode: 'resetPassword',
    })
  })

  it('accepte la query sans préfixe ?', () => {
    expect(parsePasswordResetQuery('oobCode=xyz&mode=resetPassword')).toEqual({
      oobCode: 'xyz',
      mode: 'resetPassword',
    })
  })

  it('retourne null si paramètres absents', () => {
    expect(parsePasswordResetQuery('')).toEqual({
      oobCode: null,
      mode: null,
    })
  })
})
