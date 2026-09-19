#!/usr/bin/env node
/**
 * Reserved staging-only fixture for the E1 availability-reminder journeys.
 *
 * The API fixture endpoints are deliberately unavailable on Cloud Run. This
 * script is the sole writer for this namespaced data and refuses to run without
 * an explicit staging confirmation.
 */

import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

import { buildPostgresConnectionUrl } from '../migrate-malice-load.mjs'
import { withClient } from './migrate-lib/neon.mjs'

export const REMINDER_EVENT_ID = 'c00000e1-0000-4000-8000-000000000001'
export const REMINDER_EVENT_SLUG = 'e1-reminder-fixture'
const REMINDER_EVENT_TITLE = '[E2E] Rappel disponibilités isolé'

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    troupeSlug: process.env.HATCAST_E2E_TROUPE_SLUG?.trim() || 'la-malice',
    seasonSlug: process.env.HATCAST_E2E_SEASON_SLUG?.trim(),
    organizerEmail: process.env.HATCAST_E2E_REMINDER_ORGANIZER_EMAIL?.trim(),
    recipientEmail: process.env.HATCAST_E2E_MEMBER_EMAIL?.trim(),
    fixtureSlug: process.env.HATCAST_E2E_REMINDER_EVENT_SLUG?.trim() || REMINDER_EVENT_SLUG,
    confirmStaging: process.env.HATCAST_E2E_STAGING_FIXTURE_CONFIRM?.trim(),
    stagingTarget: process.env.HATCAST_E2E_STAGING_TARGET?.trim(),
    githubEnv: process.env.GITHUB_ENV?.trim(),
  }
  let rawDatabaseUrl = process.env.HATCAST_DATASOURCE_URL?.trim() || process.env.NEON_STAGING_URL?.trim()
  for (const arg of argv) {
    if (arg.startsWith('--database-url=')) rawDatabaseUrl = arg.slice('--database-url='.length)
    else if (arg.startsWith('--troupe-slug=')) options.troupeSlug = arg.slice('--troupe-slug='.length)
    else if (arg.startsWith('--season-slug=')) options.seasonSlug = arg.slice('--season-slug='.length)
    else if (arg.startsWith('--organizer-email=')) options.organizerEmail = arg.slice('--organizer-email='.length)
    else if (arg.startsWith('--recipient-email=')) options.recipientEmail = arg.slice('--recipient-email='.length)
    else if (arg.startsWith('--fixture-slug=')) options.fixtureSlug = arg.slice('--fixture-slug='.length)
    else if (arg.startsWith('--confirm-staging=')) options.confirmStaging = arg.slice('--confirm-staging='.length)
    else if (arg.startsWith('--github-env=')) options.githubEnv = arg.slice('--github-env='.length)
  }
  return {
    ...options,
    databaseUrl: rawDatabaseUrl
      ? buildPostgresConnectionUrl(rawDatabaseUrl, {
          username: process.env.HATCAST_DATASOURCE_USERNAME,
          password: process.env.HATCAST_DATASOURCE_PASSWORD ?? '',
        })
      : undefined,
  }
}

export function assertStagingTarget(options) {
  if (options.confirmStaging !== 'staging' || options.stagingTarget !== 'staging' || !options.githubEnv) {
    throw new Error('Refusing fixture write: requires staging confirmation, HATCAST_E2E_STAGING_TARGET=staging, and GitHub Actions environment file')
  }
  const url = new URL(options.databaseUrl)
  if (!url.hostname.endsWith('.neon.tech') || /(?:^|[-_.])prod(?:uction)?(?:[-_.]|$)/i.test(`${url.hostname}${url.pathname}`)) {
    throw new Error('Refusing fixture write: database URL is not an approved staging Neon target')
  }
}

function assertFixtureSlug(value) {
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(value)) {
    throw new Error('HATCAST_E2E_REMINDER_EVENT_SLUG must be a safe lowercase slug')
  }
  return value
}

function requireOption(value, name) {
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

/** Keep this pure so the staging data contract is fast to regression-test. */
export function assertReminderFixtureSnapshot(snapshot, fixtureSlug) {
  if (!snapshot.organizerActiveMember) {
    throw new Error('Reminder organizer must be an active troupe member')
  }
  if (!snapshot.organizerSeasonOrganizer || snapshot.organizerTroupeAdmin || snapshot.organizerActiveParticipant) {
    throw new Error('Reminder organizer role boundary failed (season organizer only, no active participant)')
  }
  if (!snapshot.event || snapshot.event.slug !== fixtureSlug) {
    throw new Error(`Reminder fixture "${fixtureSlug}" is missing or aliased`)
  }
  const startsAt = Date.parse(snapshot.event.startsAt)
  if (snapshot.event.archived || !snapshot.event.availabilityOpenedAt || !Number.isFinite(startsAt) || startsAt <= Date.now()) {
    throw new Error(`Reminder fixture "${fixtureSlug}" must be open, published, and future`)
  }
  if (!snapshot.hasUnknownRecipient) {
    throw new Error(`Reminder fixture "${fixtureSlug}" has no unanswered recipient`)
  }
  if (!snapshot.hasNotifiableRecipient) {
    throw new Error(`Reminder fixture "${fixtureSlug}" has no notifiable recipient`)
  }
}

async function bootstrap(client, options) {
  const troupeSlug = requireOption(options.troupeSlug, 'HATCAST_E2E_TROUPE_SLUG')
  const seasonSlug = requireOption(options.seasonSlug, 'HATCAST_E2E_SEASON_SLUG')
  const organizerEmail = requireOption(options.organizerEmail, 'HATCAST_E2E_REMINDER_ORGANIZER_EMAIL')
  const recipientEmail = requireOption(options.recipientEmail, 'HATCAST_E2E_MEMBER_EMAIL')
  const fixtureSlug = assertFixtureSlug(requireOption(options.fixtureSlug, 'HATCAST_E2E_REMINDER_EVENT_SLUG'))
  const seasonResult = await client.query(
    `SELECT s.id, t.id AS troupe_id
     FROM seasons s JOIN troupes t ON t.id = s.troupe_id
     WHERE t.slug = $1 AND s.slug = $2
     FOR UPDATE`,
    [troupeSlug, seasonSlug],
  )
  if (seasonResult.rowCount !== 1) throw new Error(`Staging season not found: ${troupeSlug}/${seasonSlug}`)
  const season = seasonResult.rows[0]

  // The UUID is intentionally fixed so the bootstrap can reset the exact same
  // record. Never repurpose it if another season already owns it.
  const fixtureIdOwner = await client.query(
    `SELECT season_id FROM events WHERE id = $1::uuid FOR UPDATE`,
    [REMINDER_EVENT_ID],
  )
  if (fixtureIdOwner.rowCount === 1 && fixtureIdOwner.rows[0].season_id !== season.id) {
    throw new Error(`Reminder fixture ID ${REMINDER_EVENT_ID} belongs to another season`)
  }

  const organizerResult = await client.query(
    `SELECT u.id AS user_id, tm.id AS membership_id, tm.status, tm.baseline_role
     FROM users u
     JOIN troupe_memberships tm ON tm.user_id = u.id AND tm.troupe_id = $1::uuid
     WHERE lower(u.email) = lower($2)
     FOR UPDATE OF tm`,
    [season.troupe_id, organizerEmail],
  )
  if (organizerResult.rowCount !== 1) {
    throw new Error('Reminder organizer has no dedicated troupe membership in the selected staging troupe')
  }
  const organizer = organizerResult.rows[0]
  if (organizer.baseline_role !== 'MEMBER') {
    throw new Error('Reminder organizer must not have troupe administrator privileges')
  }

  await client.query(
    `UPDATE troupe_memberships SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1::uuid`,
    [organizer.membership_id],
  )
  await client.query(
    `INSERT INTO season_organizers (season_id, user_id, granted_at, granted_by_user_id)
     VALUES ($1::uuid, $2::uuid, CURRENT_TIMESTAMP, NULL)
     ON CONFLICT (season_id, user_id) DO NOTHING`,
    [season.id, organizer.user_id],
  )
  // Keep the linked row removed rather than deleting it: membership sync respects
  // SEASON_ADMIN and will not silently reintroduce the organizer as a participant.
  await client.query(
    `UPDATE season_participants
     SET status = 'REMOVED', removed_at = CURRENT_TIMESTAMP, removal_source = 'SEASON_ADMIN', updated_at = CURRENT_TIMESTAMP
     WHERE season_id = $1::uuid AND (user_id = $2::uuid OR troupe_membership_id = $3::uuid)`,
    [season.id, organizer.user_id, organizer.membership_id],
  )

  const recipientResult = await client.query(
    `SELECT u.id AS user_id, tm.id AS membership_id, sp.id AS participant_id
     FROM users u
     JOIN troupe_memberships tm ON tm.user_id = u.id AND tm.troupe_id = $1::uuid
     JOIN season_participants sp ON sp.season_id = $2::uuid AND (sp.user_id = u.id OR sp.troupe_membership_id = tm.id)
     WHERE lower(u.email) = lower($3)
     FOR UPDATE OF tm, sp`,
    [season.troupe_id, season.id, recipientEmail],
  )
  if (recipientResult.rowCount !== 1) {
    throw new Error('Reminder recipient must be the dedicated E2E member with an existing season participant')
  }
  const recipient = recipientResult.rows[0]
  await client.query(`UPDATE troupe_memberships SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1::uuid`, [recipient.membership_id])
  await client.query(
    `UPDATE season_participants
     SET status = 'ACTIVE', removed_at = NULL, removal_source = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1::uuid`,
    [recipient.participant_id],
  )

  const existing = await client.query(
    `SELECT id FROM events WHERE season_id = $1::uuid AND slug = $2 FOR UPDATE`,
    [season.id, fixtureSlug],
  )
  if (existing.rowCount === 1 && existing.rows[0].id !== REMINDER_EVENT_ID) {
    throw new Error(`Reminder fixture slug "${fixtureSlug}" is already owned by non-E2E event ${existing.rows[0].id}`)
  }
  await client.query(
    `INSERT INTO events (
       id, season_id, slug, title, description, location, starts_at, archived,
       template_type, role_slots, category, availability_opened_at, created_at, updated_at
     ) VALUES (
       $1::uuid, $2::uuid, $3, $4, $5, $6, CURRENT_TIMESTAMP + INTERVAL '7 days', FALSE,
       'custom', $7, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
     )
     ON CONFLICT (id) DO UPDATE SET
       slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description,
       location = EXCLUDED.location, starts_at = EXCLUDED.starts_at, archived = FALSE,
       template_type = EXCLUDED.template_type, role_slots = EXCLUDED.role_slots,
       category = NULL, availability_opened_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`,
    [
      REMINDER_EVENT_ID,
      season.id,
      fixtureSlug,
      REMINDER_EVENT_TITLE,
      'Fixture E2E staging isolée pour la prévisualisation de rappel de disponibilité.',
      'Fixture E2E',
      JSON.stringify({ player: 1 }),
    ],
  )
  await client.query(`DELETE FROM event_availability WHERE event_id = $1::uuid`, [REMINDER_EVENT_ID])
  await client.query(`DELETE FROM event_participant_exclusions WHERE event_id = $1::uuid`, [REMINDER_EVENT_ID])
  await client.query(`DELETE FROM event_manual_share_notify WHERE event_id = $1::uuid`, [REMINDER_EVENT_ID])
  await client.query(`DELETE FROM notification_delivery_log WHERE event_id = $1::uuid`, [REMINDER_EVENT_ID])
  await client.query(
    `UPDATE seasons s SET
       event_count = (SELECT COUNT(*)::int FROM events e WHERE e.season_id = s.id AND e.archived = FALSE),
       participant_count = (SELECT COUNT(*)::int FROM season_participants sp WHERE sp.season_id = s.id AND sp.status = 'ACTIVE'),
       updated_at = CURRENT_TIMESTAMP
     WHERE s.id = $1::uuid`,
    [season.id],
  )

  const snapshotResult = await client.query(
    `SELECT
       EXISTS (SELECT 1 FROM troupe_memberships WHERE id = $2::uuid AND status = 'ACTIVE' AND baseline_role = 'MEMBER') AS organizer_active_member,
       EXISTS (SELECT 1 FROM season_organizers WHERE season_id = $1::uuid AND user_id = $3::uuid) AS organizer_season_organizer,
       EXISTS (SELECT 1 FROM troupe_memberships WHERE id = $2::uuid AND baseline_role = 'TROUPE_ADMIN') AS organizer_troupe_admin,
       EXISTS (SELECT 1 FROM season_participants WHERE season_id = $1::uuid AND status = 'ACTIVE' AND (user_id = $3::uuid OR troupe_membership_id = $2::uuid)) AS organizer_active_participant,
       (SELECT row_to_json(e) FROM (
         SELECT slug, archived, availability_opened_at AS "availabilityOpenedAt", starts_at AS "startsAt"
         FROM events WHERE id = $4::uuid
       ) e) AS event,
       EXISTS (
         SELECT 1 FROM season_participants sp
         WHERE sp.id = $5::uuid AND sp.season_id = $1::uuid AND sp.status = 'ACTIVE'
           AND NOT EXISTS (SELECT 1 FROM event_availability ea WHERE ea.event_id = $4::uuid AND ea.season_participant_id = sp.id)
       ) AS has_unknown_recipient,
       EXISTS (
         SELECT 1 FROM season_participants sp JOIN users u ON u.id = sp.user_id
         WHERE sp.id = $5::uuid AND NULLIF(trim(u.email), '') IS NOT NULL
       ) AS has_notifiable_recipient`,
    [season.id, organizer.membership_id, organizer.user_id, REMINDER_EVENT_ID, recipient.participant_id],
  )
  const row = snapshotResult.rows[0]
  assertReminderFixtureSnapshot(
    {
      organizerActiveMember: row.organizer_active_member,
      organizerSeasonOrganizer: row.organizer_season_organizer,
      organizerTroupeAdmin: row.organizer_troupe_admin,
      organizerActiveParticipant: row.organizer_active_participant,
      event: row.event,
      hasUnknownRecipient: row.has_unknown_recipient,
      hasNotifiableRecipient: row.has_notifiable_recipient,
    },
    fixtureSlug,
  )
  return { fixtureSlug, seasonId: season.id }
}

async function main() {
  const options = parseArgs()
  const databaseUrl = requireOption(options.databaseUrl, 'HATCAST_DATASOURCE_URL')
  assertStagingTarget({ ...options, databaseUrl })
  const result = await withClient(databaseUrl, async (client) => {
    await client.query('BEGIN')
    try {
      const fixture = await bootstrap(client, options)
      await client.query('COMMIT')
      return fixture
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  })
  if (options.githubEnv) {
    appendFileSync(options.githubEnv, `HATCAST_E2E_REMINDER_EVENT_SLUG=${result.fixtureSlug}\n`)
  }
  console.log(`E1 reminder staging fixture ready: ${result.fixtureSlug} (season ${result.seasonId})`)
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (isMain) {
  main().catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })
}
