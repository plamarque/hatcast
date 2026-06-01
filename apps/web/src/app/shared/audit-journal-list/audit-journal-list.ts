import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import type { AuditEventRow } from '../../core/audit/audit-api.service'
import { auditDayLabel, auditLocalDayKey } from '../../core/audit/audit-day-label'
import {
  formatAuditDisplayLines,
  type AuditLineFormatOptions,
  type AuditLineViewModel,
} from '../../core/audit/audit-line-formatter'
import { AuditLineView } from './audit-line-view'

export type AuditJournalListItem =
  | { type: 'day'; track: string; label: string }
  | { type: 'entry'; track: string; line: AuditLineViewModel }

@Component({
  selector: 'app-audit-journal-list',
  imports: [MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule, AuditLineView],
  templateUrl: './audit-journal-list.html',
  styleUrl: './audit-journal-list.scss',
})
export class AuditJournalList {
  readonly rows = input<AuditEventRow[]>([])
  readonly loading = input(false)
  readonly error = input(false)
  readonly emptyLabel = input('Aucune entrée dans le journal.')
  readonly page = input(0)
  readonly pageSize = input(25)
  readonly totalElements = input(0)
  readonly formatOptions = input<AuditLineFormatOptions>({})

  readonly pageChange = output<PageEvent>()
  readonly retry = output<void>()

  protected readonly formattedLines = computed(() =>
    this.rows().flatMap((row) => formatAuditDisplayLines(row, this.formatOptions())),
  )

  protected readonly listItems = computed((): AuditJournalListItem[] => {
    const items: AuditJournalListItem[] = []
    let currentDayKey: string | null = null
    for (const line of this.formattedLines()) {
      const dayKey = auditLocalDayKey(line.occurredAt)
      if (dayKey !== currentDayKey) {
        currentDayKey = dayKey
        items.push({
          type: 'day',
          track: `day-${dayKey}`,
          label: auditDayLabel(line.occurredAt),
        })
      }
      items.push({ type: 'entry', track: line.key, line })
    }
    return items
  })

  protected onPage(event: PageEvent): void {
    this.pageChange.emit(event)
  }
}
