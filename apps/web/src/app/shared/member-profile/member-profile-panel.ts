import { AfterViewChecked, Component, computed, ElementRef, input, output, viewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'

import type {
  MemberProfileChartBlock,
  MemberProfileSummary,
} from '../../core/member-profile/member-profile-api.service'
import {
  participationChartModifier,
  resolveParticipationChartStatus,
  type ParticipationChartStatus,
} from '../../core/participation/participation-status'
import {
  roleDisplayChipItems,
  roleFavoriteCountSuffix,
} from '../event-roles/role-display-chip-set/role-display-chip-item'
import { RoleDisplayChipSet } from '../event-roles/role-display-chip-set/role-display-chip-set'
import { getRoleLabel, roleEmoji, type RoleKey } from '../event-roles/event-roles'
import { RoleToggleChipSet } from '../event-roles/role-toggle-chip-set/role-toggle-chip-set'

@Component({
  selector: 'app-member-profile-panel',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RoleDisplayChipSet,
    RoleToggleChipSet,
  ],
  templateUrl: './member-profile-panel.html',
  styleUrl: './member-profile-dialog.scss',
})
export class MemberProfilePanel implements AfterViewChecked {
  readonly profile = input.required<MemberProfileSummary>()
  readonly loading = input(false)
  readonly saving = input(false)
  readonly selectedRoleKeys = input<readonly string[]>([])
  readonly showPreferredRoles = input(true)
  readonly showCloseButton = input(false)
  /** L2 on hub pages (`h2`), L3 under dialog title (`h3`). */
  readonly sectionHeadingLevel = input<2 | 3>(3)

  readonly preferredRolesChange = output<readonly string[]>()
  readonly savePreferredRoles = output<void>()
  readonly closeRequested = output<void>()
  private readonly chart = viewChild<ElementRef<HTMLElement>>('monthlyChart')
  private focusedChartKey = ''

  protected readonly hasStats = computed(() => !!this.profile().stats)
  protected readonly hasFavoriteCounts = computed(
    () => (this.profile().favoriteRoleCounts?.length ?? 0) > 0,
  )
  protected readonly favoriteRoleChipItems = computed(() =>
    roleDisplayChipItems(
      (this.profile().favoriteRoleCounts ?? []).map((item) => item.roleKey as RoleKey),
      (key) => {
        const match = (this.profile().favoriteRoleCounts ?? []).find((item) => item.roleKey === key)
        return match ? roleFavoriteCountSuffix(match.count) : undefined
      },
    ),
  )
  protected readonly chartHeading = computed(() =>
    "En un clin d'œil",
  )
  /** One label per contiguous year keeps the time scale readable without widening each month. */
  protected readonly chartYears = computed(() => {
    const groups: Array<{ year: string; monthCount: number }> = []
    for (const month of this.profile().monthlyChart) {
      const year = month.monthKey.slice(0, 4)
      const current = groups.at(-1)
      if (current?.year === year) current.monthCount++
      else groups.push({ year, monthCount: 1 })
    }
    return groups
  })
  private readonly shortMonths = [
    'JAN',
    'FEV',
    'MAR',
    'AVR',
    'MAI',
    'JUN',
    'JUL',
    'AOU',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ]

  protected roleLabel(key: RoleKey): string {
    return getRoleLabel(key, this.profile().gender)
  }

  protected roleEmoji(key: RoleKey): string {
    return roleEmoji(key)
  }

  protected monthLabel(monthKey: string): string {
    const [, monthRaw] = monthKey.split('-')
    const monthIndex = Number.parseInt(monthRaw ?? '', 10) - 1
    if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return monthKey
    }
    return this.shortMonths[monthIndex] ?? monthKey
  }

  ngAfterViewChecked(): void {
    const months = this.profile().monthlyChart
    const chart = this.chart()?.nativeElement
    const key = months.map((month) => month.monthKey).join(',')
    if (!chart || !key || key === this.focusedChartKey) return
    this.focusedChartKey = key
    const now = new Date()
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const target = chart.querySelector<HTMLElement>(`[data-month-key="${currentKey}"]`)
    if (target) chart.scrollLeft = Math.max(0, target.offsetLeft - (chart.clientWidth - target.clientWidth) / 2)
  }

  protected chartBlockRoleEmoji(roleKey: string | null | undefined): string | null {
    if (!roleKey) {
      return null
    }
    return roleEmoji(roleKey as RoleKey)
  }

  protected chartBlockResolvedStatus(block: MemberProfileChartBlock): ParticipationChartStatus {
    return resolveParticipationChartStatus(block.status, block.roleKey)
  }

  protected chartBlockModifierClass(block: MemberProfileChartBlock): string {
    const suffix = participationChartModifier(this.chartBlockResolvedStatus(block))
    return `member-profile__chart-block member-profile__chart-block${suffix}`
  }

  protected chartBlockTooltip(block: MemberProfileChartBlock): string {
    const title = block.eventTitle?.trim() || 'Événement'
    const date = this.formatChartEventDate(block.eventDate)
    const status = this.chartBlockStatusLabel(block)
    return `${title}\n${date}\n${status}`
  }

  protected formatChartEventDate(eventDate: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate.trim())
    if (!match) {
      return eventDate
    }
    return `${match[3]}/${match[2]}`
  }

  protected chartBlockStatusLabel(block: MemberProfileChartBlock): string {
    const status = this.chartBlockResolvedStatus(block)
    if (block.roleKey && status !== 'unavailable' && status !== 'available') {
      const role = this.roleLabel(block.roleKey as RoleKey)
      if (status === 'declined') {
        return `${role} — Retrait`
      }
      if (status === 'pending') {
        return `${role} — En attente`
      }
      return role
    }
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'unavailable':
        return 'Indisponible'
      case 'declined':
        return 'Retrait'
      case 'pending':
        return 'En attente de confirmation'
      default:
        return 'Non renseigné'
    }
  }

  protected onPreferredRolesChange(keys: readonly string[]): void {
    this.preferredRolesChange.emit(keys)
  }

  protected onSavePreferredRoles(): void {
    this.savePreferredRoles.emit()
  }

  protected onClose(): void {
    this.closeRequested.emit()
  }
}
