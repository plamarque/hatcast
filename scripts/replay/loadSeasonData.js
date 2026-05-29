/**
 * Charge les données d'une saison depuis Firestore (base dev)
 * Utilise Firebase Admin SDK pour un accès headless
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/** @type {Map<string, import('firebase-admin/firestore').Firestore>} */
const dbByDatabase = new Map()

/**
 * Normalize a Firestore database id (BUG-DOC-001).
 *
 * The Firestore production default database id is the literal `(default)`.
 * Docs and CLIs historically pass `--database=default`, but
 * `getFirestore(app, 'default')` resolves to a non-existent database and fails
 * with gRPC `5 NOT_FOUND`. Map the human label `default` (and empty) to the
 * real id `(default)`. `development`, `staging`, `(default)`, etc. pass through.
 *
 * @param {string | null | undefined} databaseId
 * @returns {string}
 */
export function normalizeDatabaseId(databaseId) {
  const id = (databaseId ?? '').trim()
  if (id === '' || id === 'default') return '(default)'
  return id
}

/**
 * @param {string} [databaseId='development']
 */
export function getDb(databaseId = 'development') {
  databaseId = normalizeDatabaseId(databaseId)
  if (!dbByDatabase.has(databaseId)) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    let app
    if (clientEmail && privateKey && projectId) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } else if (projectId) {
      try {
        app = initializeApp({
          credential: applicationDefault(),
          projectId,
        })
      } catch (err) {
        throw new Error(
          'Firebase Admin: use either (1) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env.local, ' +
            'or (2) VITE_FIREBASE_PROJECT_ID + gcloud auth application-default login (or GOOGLE_APPLICATION_CREDENTIALS).',
        )
      }
    } else {
      throw new Error(
        'Firebase project ID required. Set FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID in .env.local.',
      )
    }

    dbByDatabase.set(databaseId, getFirestore(app, databaseId))
  }
  return dbByDatabase.get(databaseId)
}

function toDate(v) {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v?.toDate === 'function') return v.toDate()
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Charge les événements d'une saison, triés par date
 * @param {string} seasonId
 * @returns {Promise<Array>}
 */
export async function loadEvents(seasonId) {
  const snapshot = await getDb()
    .collection('seasons')
    .doc(seasonId)
    .collection('events')
    .get()

  const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  return events
    .filter(e => e.archived !== true)
    .sort((a, b) => {
      const ta = toDate(a.date)?.getTime() ?? Number.POSITIVE_INFINITY
      const tb = toDate(b.date)?.getTime() ?? Number.POSITIVE_INFINITY
      if (ta !== tb) return ta - tb
      return (a.title || '').localeCompare(b.title || '', 'fr', { sensitivity: 'base' })
    })
}

/**
 * Charge les joueurs d'une saison
 * @param {string} seasonId
 * @returns {Promise<Array>}
 */
export async function loadPlayers(seasonId) {
  const snapshot = await getDb()
    .collection('seasons')
    .doc(seasonId)
    .collection('players')
    .get()

  const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  return players.sort((a, b) => {
    if (a.order < b.order) return -1
    if (a.order > b.order) return 1
    return (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' })
  })
}

/**
 * Charge les disponibilités pour tous les joueurs
 * Format: { [playerName]: { [eventId]: { available, roles, ... } } }
 * @param {string} seasonId
 * @param {Array} players
 * @returns {Promise<Object>}
 */
/**
 * Flat availability records for migration (MIG-3). Keyed by V1 player doc id.
 *
 * @param {string} seasonId
 * @param {Array<{ id: string }>} players
 * @param {string} [databaseId='development']
 * @returns {Promise<Array<{ v1PlayerId: string, v1EventId: string, available: boolean, roles: string[], comment: string|null }>>}
 */
export async function loadAvailabilityRecords(seasonId, players, databaseId = 'development') {
  const db = getDb(databaseId)
  const records = []
  const failures = []

  await Promise.all(
    players.map(async (player) => {
      try {
        const snapshot = await db
          .collection('seasons')
          .doc(seasonId)
          .collection('players')
          .doc(player.id)
          .collection('availability')
          .get()

        snapshot.docs.forEach((doc) => {
          const data = doc.data() || {}
          records.push({
            v1PlayerId: player.id,
            v1EventId: doc.id,
            available: data.available === true,
            roles: Array.isArray(data.roles) ? data.roles : [],
            comment: typeof data.comment === 'string' ? data.comment : null,
          })
        })
      } catch (err) {
        // Never silently drop a player's availability: a faithful read-only
        // migration must surface partial reads so the operator can react.
        failures.push({ playerId: player.id, message: err?.message || String(err) })
      }
    }),
  )

  if (failures.length > 0) {
    console.error(
      `⚠️  loadAvailabilityRecords: ${failures.length} player subcollection(s) unreadable — availability is INCOMPLETE:`,
    )
    for (const f of failures) console.error(`   • player ${f.playerId}: ${f.message}`)
  }

  return records
}

export async function loadAvailability(seasonId, players) {
  const availability = {}

  const results = await Promise.all(
    players.map(async (player) => {
      try {
        const snapshot = await getDb()
          .collection('seasons')
          .doc(seasonId)
          .collection('players')
          .doc(player.id)
          .collection('availability')
          .get()

        const playerAvailability = {}
        snapshot.docs.forEach(doc => {
          playerAvailability[doc.id] = doc.data()
        })
        return { playerName: player.name, playerAvailability, success: true }
      } catch (err) {
        return { playerName: player.name, playerAvailability: {}, success: false }
      }
    })
  )

  results.forEach(({ playerName, playerAvailability }) => {
    availability[playerName] = playerAvailability
  })

  return availability
}

/**
 * Charge les casts d'une saison
 * Format: { [eventId]: { roles, confirmed, declined, ... } }
 * @param {string} seasonId
 * @returns {Promise<Object>}
 */
export async function loadCasts(seasonId, databaseId = 'development') {
  const snapshot = await getDb(databaseId)
    .collection('seasons')
    .doc(seasonId)
    .collection('casts')
    .get()

  const res = {}
  snapshot.docs.forEach(doc => {
    const data = doc.data()
    res[doc.id] = {
      roles: data.roles || {},
      declined: data.declined || {},
      confirmed: data.confirmed || false,
      confirmedAt: data.confirmedAt || null,
      updatedAt: data.updatedAt || null,
      playerStatuses: data.playerStatuses || {},
      confirmedByAllPlayers: data.confirmedByAllPlayers || false,
      status: data.status || null,
      statusDetails: data.statusDetails || null
    }
  })

  return res
}

/**
 * Charge toutes les données d'une saison
 * @param {string} seasonId
 * @returns {Promise<{ events, players, availability, casts }>}
 */
export async function loadSeasonData(seasonId) {
  const [events, players] = await Promise.all([
    loadEvents(seasonId),
    loadPlayers(seasonId)
  ])

  const [availability, casts] = await Promise.all([
    loadAvailability(seasonId, players),
    loadCasts(seasonId)
  ])

  return { events, players, availability, casts }
}
