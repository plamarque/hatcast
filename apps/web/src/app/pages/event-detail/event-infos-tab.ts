import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import type { EventResponse } from '../../core/events/event-api.service'
import { EventApiService } from '../../core/events/event-api.service'
import {
  type EventTypeId,
  getEventTypeIcon,
  getEventTypeLabel,
  normalizeRoleSlots,
  type RoleKey,
  ROLE_EMOJIS,
  ROLE_LABELS,
  rolesWithSlots,
} from '../../core/events/event-types'
import { compositionStatusHint } from '../../core/composition/composition-status-hint'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'
import {
  type TroupeEquityTag,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'
import {
  EventEquityTagDialog,
  type EventEquityTagDialogData,
  type EventEquityTagDialogResult,
} from './event-equity-tag-dialog'
import {
  EventTypeRolesDialog,
  type EventTypeRolesDialogData,
  type EventTypeRolesDialogResult,
} from './event-type-roles-dialog'

@Component({
  selector: 'app-event-infos-tab',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    CompositionStatusBadge,
    ScopeAdminMenu,
  ],
  templateUrl: './event-infos-tab.html',
  styleUrl: './event-infos-tab.scss',
})
export class EventInfosTab {
  private readonly eventsApi = inject(EventApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  readonly event = input.required<EventResponse>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly canManageEvents = input(false)
  readonly canManageComposition = input(false)
  readonly adminItems = input<ScopeAdminMenuItem[]>([])

  readonly eventUpdated = output<EventResponse>()

  protected readonly glossary = signal<TroupeEquityTag[]>([])
  protected readonly saving = signal(false)

  protected readonly showEquitySection = computed(
    () => this.canManageEvents() || this.event().equityTag != null,
  )

  protected readonly typeIcon = computed(() => getEventTypeIcon(this.event().templateType))
  protected readonly typeLabel = computed(() => getEventTypeLabel(this.event().templateType))
  protected readonly summaryRoleKeys = computed((): RoleKey[] =>
    rolesWithSlots(normalizeRoleSlots(this.event().roleSlots)),
  )
  protected readonly roleLabels = ROLE_LABELS
  protected readonly roleEmojis = ROLE_EMOJIS

  protected readonly equityTagLabel = computed(() => {
    const slug = this.event().equityTag
    if (!slug) {
      return null
    }
    return this.glossary().find((t) => t.slug === slug)?.label ?? slug
  })

  constructor() {
    effect(() => {
      const troupeId = this.troupeId()
      if (troupeId) {
        void this.loadGlossary(troupeId)
      }
    })
  }

  protected compositionStatusHint(ev: EventResponse): string | null {
    return compositionStatusHint(ev.compositionLifecycle, {
      canManageComposition: this.canManageComposition(),
      compositionPublishedAt: ev.compositionPublishedAt,
    })
  }

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: AGENDA_TIME_ZONE,
    }).format(new Date(iso))
  }

  protected onChipClick(): void {
    if (this.canManageEvents()) {
      this.openTagDialog()
    }
  }

  protected roleCount(role: RoleKey): number {
    return normalizeRoleSlots(this.event().roleSlots)[role] ?? 0
  }

  protected openTypeRolesDialog(): void {
    const ev = this.event()
    const ref = this.dialog.open<
      EventTypeRolesDialog,
      EventTypeRolesDialogData,
      EventTypeRolesDialogResult
    >(EventTypeRolesDialog, {
      data: {
        seasonId: this.seasonId(),
        eventId: ev.id,
        templateType: ev.templateType,
        roleSlots: ev.roleSlots,
      },
      width: 'min(100vw - 2rem, 32rem)',
    })
    ref.afterClosed().subscribe((result) => {
      if (result === undefined) {
        return
      }
      void this.persistTypeRoles(result)
    })
  }

  protected openTagDialog(): void {
    const label = this.equityTagLabel()
    const ref = this.dialog.open<
      EventEquityTagDialog,
      EventEquityTagDialogData,
      EventEquityTagDialogResult
    >(EventEquityTagDialog, {
      data: {
        troupeId: this.troupeId(),
        initialQuery: label ?? '',
      },
      width: 'min(100vw - 2rem, 32rem)',
    })
    ref.afterClosed().subscribe((result) => {
      if (result === undefined) {
        return
      }
      void this.persistTag(result)
    })
  }

  protected removeTag(): void {
    void this.persistTag(null)
  }

  private async persistTypeRoles(result: {
    templateType: EventTypeId
    roleSlots: Record<string, number>
  }): Promise<void> {
    const seasonId = this.seasonId()
    const ev = this.event()
    const body = {
      templateType: result.templateType,
      roleSlots: normalizeRoleSlots(result.roleSlots),
    }

    this.saving.set(true)
    try {
      const apiResult = await this.eventsApi.updateEvent(seasonId, ev.id, body)
      if (!apiResult.ok || !apiResult.data) {
        const message = apiResult.errorMessage ?? 'Enregistrement impossible.'
        this.snack.open(message, 'OK', { duration: 6000 })
        return
      }
      this.eventUpdated.emit(apiResult.data)
      this.snack.open('Format et besoins enregistrés.', 'OK', { duration: 4000 })
    } finally {
      this.saving.set(false)
    }
  }

  private async persistTag(value: string | null): Promise<void> {
    const seasonId = this.seasonId()
    const ev = this.event()
    const body = { equityTag: value }

    this.saving.set(true)
    try {
      const result = await this.eventsApi.updateEvent(seasonId, ev.id, body)
      if (!result.ok || !result.data) {
        const message = result.errorMessage ?? 'Enregistrement impossible.'
        this.snack.open(message, 'OK', { duration: 6000 })
        return
      }
      this.eventUpdated.emit(result.data)
      const cleared = result.data.equityTag == null
      this.snack.open(
        cleared ? 'Tag retiré.' : 'Tag enregistré.',
        'OK',
        { duration: 4000 },
      )
    } finally {
      this.saving.set(false)
    }
  }

  private async loadGlossary(troupeId: string): Promise<void> {
    const r = await this.troupeApi.listEquityTags(troupeId)
    if (troupeId !== this.troupeId()) {
      return
    }
    if (r.ok && r.data) {
      this.glossary.set(r.data)
    }
  }
}
