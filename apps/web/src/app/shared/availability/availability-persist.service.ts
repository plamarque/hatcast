import { inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'

import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import { normalizeCandidateRoleKeys } from '../../core/availability/availability-role-rules'
import type { RoleKey, RoleSlots } from '../../core/events/event-types'

export const AVAILABILITY_COMMENT_MAX_LENGTH = 500

export type AvailabilityPersistScope = 'status' | 'details'

export type AvailabilityPersistResult = {
  ok: boolean
  status: number
  data?: {
    status: AvailabilityStatus
    roleKeys: string[]
    comment?: string | null
  }
}

@Injectable({ providedIn: 'root' })
export class AvailabilityPersistService {
  private readonly api = inject(AvailabilityApiService)
  private readonly analytics = inject(ProductAnalyticsService)
  private readonly snack = inject(MatSnackBar)

  async saveVote(options: {
    seasonId: string
    eventId: string
    troupeId: string
    roleSlots: RoleSlots
    subjectParticipantId: string | null
    proxyMode: boolean
    status: AvailabilityStatus
    roleKeys: RoleKey[]
    applyVolunteerRule: boolean
    savedComment: string | null
    initialStatus: AvailabilityStatus
    availabilityOpenedAt: string | null
  }): Promise<AvailabilityPersistResult> {
    const comment = options.savedComment?.trim() ? options.savedComment.trim() : null
    const body = {
      status: options.status,
      roleKeys: options.status === 'available' ? options.roleKeys : [],
      applyVolunteerRule: options.applyVolunteerRule,
      comment,
    }
    const result = await this.putAvailability(
      options.seasonId,
      options.eventId,
      options.subjectParticipantId,
      options.proxyMode,
      body,
    )
    if (result.ok && result.data) {
      this.trackFirstSubmissionIfNeeded({
        wasFirstSubmission: options.initialStatus === 'unknown',
        availabilityOpenedAt: options.availabilityOpenedAt,
        eventId: options.eventId,
        seasonId: options.seasonId,
        troupeId: options.troupeId,
        proxyMode: options.proxyMode,
      })
    } else {
      this.showSaveError(result.status)
    }
    return result
  }

  async saveCommentOnly(options: {
    seasonId: string
    eventId: string
    subjectParticipantId: string | null
    proxyMode: boolean
    status: AvailabilityStatus
    roleKeys: RoleKey[]
    applyVolunteerRule: boolean
    comment: string | null
  }): Promise<AvailabilityPersistResult> {
    if ((options.comment?.length ?? 0) > AVAILABILITY_COMMENT_MAX_LENGTH) {
      return { ok: false, status: 400 }
    }
    const body = {
      status: options.status,
      roleKeys: options.status === 'available' ? options.roleKeys : [],
      applyVolunteerRule: options.applyVolunteerRule,
      comment: options.comment,
    }
    const result = await this.putAvailability(
      options.seasonId,
      options.eventId,
      options.subjectParticipantId,
      options.proxyMode,
      body,
    )
    if (!result.ok) {
      this.showSaveError(result.status)
    }
    return result
  }

  normalizeSavedRoleKeys(
    roleSlots: RoleSlots,
    roleKeys: string[] | null | undefined,
  ): RoleKey[] {
    return normalizeCandidateRoleKeys(roleSlots, roleKeys, false)
  }

  private async putAvailability(
    seasonId: string,
    eventId: string,
    participantId: string | null,
    proxyMode: boolean,
    body: {
      status: AvailabilityStatus
      roleKeys: RoleKey[]
      applyVolunteerRule: boolean
      comment: string | null
    },
  ): Promise<AvailabilityPersistResult> {
    if (proxyMode && participantId) {
      return this.api.setParticipantAvailability(seasonId, eventId, participantId, body)
    }
    return this.api.setMyAvailability(seasonId, eventId, body)
  }

  private trackFirstSubmissionIfNeeded(options: {
    wasFirstSubmission: boolean
    availabilityOpenedAt: string | null
    eventId: string
    seasonId: string
    troupeId: string
    proxyMode: boolean
  }): void {
    const openedAt = options.availabilityOpenedAt?.trim()
    if (!options.wasFirstSubmission || !openedAt) {
      return
    }
    this.analytics.captureAvailabilityFirstSubmission(
      this.analytics.eventContext(options.eventId, options.seasonId, options.troupeId),
      {
        is_proxy: options.proxyMode,
        opened_at: openedAt,
        submitted_at: new Date().toISOString(),
      },
    )
  }

  private showSaveError(status: number): void {
    if (status === 400) {
      this.snack.open(
        `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
        'OK',
        { duration: 5000 },
      )
      return
    }
    this.snack.open('Enregistrement impossible.', 'OK', { duration: 5000 })
  }
}
