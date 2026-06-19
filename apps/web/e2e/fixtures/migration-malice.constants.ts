/** Golden values for La Malice migration consultation smoke (palier 2). */
export const MIGRATION_MALICE_GOLDEN = {
  troupeSlug: process.env.HATCAST_E2E_TROUPE_SLUG?.trim() || 'la-malice',
  matchCamboSlug: 'match-cambo',
  memberStats: {
    availabilities: Number(process.env.HATCAST_E2E_MIG_STATS_AVAILABILITIES ?? 20),
    selections: Number(process.env.HATCAST_E2E_MIG_STATS_SELECTIONS ?? 12),
    declines: Number(process.env.HATCAST_E2E_MIG_STATS_DECLINES ?? 3),
  },
  minSeasonEvents: Number(process.env.HATCAST_E2E_MIG_MIN_EVENTS ?? 30),
  minStatsTableRows: Number(process.env.HATCAST_E2E_MIG_MIN_STATS_ROWS ?? 10),
} as const
