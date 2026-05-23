import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { buildUsersSql } from './generate-users-sql-from-firebase-export.js'

describe('generate-users-sql-from-firebase-export', () => {
  it('generates insert per email with idp uid and google sub', () => {
    const sql = buildUsersSql({
      users: [
        {
          localId: 'firebase-uid-1',
          email: 'Alice@Example.com',
          displayName: 'Alice',
          providerUserInfo: [{ providerId: 'google.com', rawId: 'google-sub-1' }],
        },
      ],
    })

    assert.match(sql, /INSERT INTO users/)
    assert.match(sql, /firebase-uid-1/)
    assert.match(sql, /google-sub-1/)
    assert.match(sql, /alice@example.com/)
    assert.match(sql, /WHERE NOT EXISTS/)
  })
})
