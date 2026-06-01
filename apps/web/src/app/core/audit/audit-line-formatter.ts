import type { AuditEventRow } from './audit-api.service'
import { expandDrawAuditLines } from './audit-draw-expander'
import { buildAuditLineViewModel, type AuditLineViewModel } from './audit-line-view-model'

export interface AuditLineFormatOptions {
  /** HH:mm for Moi mode, HH:mm:ss for admin/Tous */
  timePrecision?: 'minutes' | 'seconds'
  /** Prefix event title on season/troupe admin pages */
  showEventPrefix?: boolean
  /** Hide subject when it matches viewer participant (Moi self rows) */
  viewerParticipantName?: string | null
  /** Moi mode — shorter time */
  moiMode?: boolean
}

/** Plain one-liner — kept for tests and tooltips. */
export function formatAuditLine(row: AuditEventRow, options: AuditLineFormatOptions = {}): string {
  return buildAuditLineViewModel(row, options).fullText
}

export function formatAuditDisplayLines(
  row: AuditEventRow,
  options: AuditLineFormatOptions = {},
): AuditLineViewModel[] {
  if (row.actionType === 'COMPOSITION_DRAW_COMPLETED') {
    return expandDrawAuditLines(row, options)
  }
  return [buildAuditLineViewModel(row, options)]
}

export type { AuditLineViewModel }
