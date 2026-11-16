import assert from 'node:assert/strict'
import pg from 'pg'
import { ensureRemovedOrganizerParticipant } from './e1-staging-reminder-fixture.mjs'

const client = new pg.Client({ host: '127.0.0.1', port: Number(process.env.E1_TEST_PG_PORT), user: 'postgres', password: 'fixture-only', database: 'fixture' })
const season = '00000000-0000-4000-8000-000000000001'
const user = '00000000-0000-4000-8000-000000000002'
const member = '00000000-0000-4000-8000-000000000003'
const other = '00000000-0000-4000-8000-000000000004'
const email = 'organizer@example.test'
await client.connect()
try {
  await client.query(`CREATE TABLE users (id uuid PRIMARY KEY, email text, display_name text);
    CREATE TABLE season_participants (id uuid PRIMARY KEY, season_id uuid NOT NULL, display_name varchar(255) NOT NULL,
      normalized_email varchar(320), user_id uuid, troupe_membership_id uuid, status varchar(16) NOT NULL,
      removed_at timestamp, removal_source varchar(32), participation_mode varchar(32), created_at timestamp NOT NULL, updated_at timestamp NOT NULL,
      UNIQUE(season_id, troupe_membership_id));`)
  await client.query('INSERT INTO users VALUES ($1, $2, $3)', [user, email, 'Dedicated organizer'])
  await client.query('BEGIN')
  await ensureRemovedOrganizerParticipant(client, season, user, member, email)
  let rows = (await client.query('SELECT * FROM season_participants')).rows
  assert.equal(rows.length, 1)
  assert.equal(rows[0].status, 'REMOVED')
  assert.equal(rows[0].removal_source, 'SEASON_ADMIN')
  assert.equal(rows[0].participation_mode, 'MEMBER_SYNC')
  assert.equal(rows[0].user_id, user)
  assert.equal(rows[0].troupe_membership_id, member)
  const id = rows[0].id
  await client.query("UPDATE season_participants SET status='ACTIVE', removal_source=NULL, removed_at=NULL WHERE id=$1", [id])
  await ensureRemovedOrganizerParticipant(client, season, user, member, email)
  rows = (await client.query('SELECT * FROM season_participants')).rows
  assert.equal(rows.length, 1)
  assert.equal(rows[0].id, id)
  assert.equal(rows[0].status, 'REMOVED')
  assert.equal(rows[0].removal_source, 'SEASON_ADMIN')
  await client.query('COMMIT')
  await client.query('INSERT INTO season_participants (id,season_id,display_name,normalized_email,user_id,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)', [other, season, 'Other identity', email, other, 'ACTIVE'])
  await client.query('BEGIN')
  await assert.rejects(ensureRemovedOrganizerParticipant(client, season, user, member, email), /Conflicting or duplicate/)
  await client.query('ROLLBACK')
  rows = (await client.query('SELECT id, status FROM season_participants ORDER BY id')).rows
  assert.deepEqual(rows.map(row => [row.id, row.status]), [[id, 'REMOVED'], [other, 'ACTIVE']].sort((a,b) => a[0].localeCompare(b[0])))
  await client.query('DELETE FROM season_participants WHERE id=$1', [other])
  await client.query('UPDATE season_participants SET user_id=$2 WHERE id=$1', [id, other])
  await client.query('BEGIN')
  await assert.rejects(ensureRemovedOrganizerParticipant(client, season, user, member, email), /Conflicting or duplicate/)
  await client.query('ROLLBACK')
  const conflict = (await client.query('SELECT user_id, status FROM season_participants WHERE id=$1', [id])).rows[0]
  assert.equal(conflict.user_id, other)
  assert.equal(conflict.status, 'REMOVED')
  console.log('PostgreSQL: absent, existing, duplicate and conflicting participant cases passed')
} finally { await client.end() }
