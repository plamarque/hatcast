import { Component, inject, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'

import {
  applyTemplate,
  clampRoleCount,
  detectTemplateFromRoles,
  type EventTypeId,
  EVENT_TYPE_IDS,
  getEventTypeIcon,
  getEventTypeLabel,
  normalizeRoleSlots,
  type RoleKey,
  ROLE_DISPLAY_ORDER,
  ROLE_EMOJIS,
  ROLE_LABELS,
  roleSlotsEqual,
  rolesWithSlots,
  type RoleSlots,
  TEMPLATE_DISPLAY_ORDER,
} from '../../core/events/event-types'

export interface EventTypeRolesDialogData {
  seasonId: string
  eventId: string
  templateType: string
  roleSlots: Record<string, number>
}

export type EventTypeRolesDialogResult =
  | { templateType: EventTypeId; roleSlots: Record<string, number> }
  | undefined

@Component({
  selector: 'app-event-type-roles-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './event-type-roles-dialog.html',
  styleUrl: './event-type-roles-dialog.scss',
})
export class EventTypeRolesDialog implements OnInit {
  private readonly ref = inject(MatDialogRef<EventTypeRolesDialog, EventTypeRolesDialogResult>)
  protected readonly data = inject<EventTypeRolesDialogData>(MAT_DIALOG_DATA)

  protected showRoleInputs = false
  protected showTemplateChangeConfirmation = false
  protected pendingTemplateId: EventTypeId | null = null

  protected readonly templateOrder = TEMPLATE_DISPLAY_ORDER
  protected readonly roleDisplayOrder = ROLE_DISPLAY_ORDER
  protected readonly roleLabels = ROLE_LABELS
  protected readonly roleEmojis = ROLE_EMOJIS
  protected readonly getEventTypeIcon = getEventTypeIcon
  protected readonly getEventTypeLabel = getEventTypeLabel

  protected selectedTemplateType!: EventTypeId
  protected roleSlots!: RoleSlots

  ngOnInit(): void {
    const normalized = normalizeRoleSlots(this.data.roleSlots)
    const fromApi = this.data.templateType as EventTypeId
    this.selectedTemplateType = EVENT_TYPE_IDS.includes(fromApi)
      ? fromApi
      : detectTemplateFromRoles(normalized)
    this.roleSlots = normalized
  }

  protected summaryRoles(): RoleKey[] {
    return rolesWithSlots(this.roleSlots)
  }

  protected onTemplateSelected(typeId: EventTypeId): void {
    const templateSlots = applyTemplate(typeId)
    if (roleSlotsEqual(this.roleSlots, templateSlots)) {
      this.selectedTemplateType = typeId
      this.showTemplateChangeConfirmation = false
      this.pendingTemplateId = null
      return
    }
    this.pendingTemplateId = typeId
    this.showTemplateChangeConfirmation = true
  }

  protected confirmTemplateChange(): void {
    if (!this.pendingTemplateId) return
    this.selectedTemplateType = this.pendingTemplateId
    this.roleSlots = applyTemplate(this.pendingTemplateId)
    this.showTemplateChangeConfirmation = false
    this.pendingTemplateId = null
    this.showRoleInputs = false
  }

  protected cancelTemplateChange(): void {
    this.showTemplateChangeConfirmation = false
    this.pendingTemplateId = null
  }

  protected enableCustomization(): void {
    this.showRoleInputs = true
  }

  protected hideCustomization(): void {
    this.showRoleInputs = false
  }

  protected onRoleCountChange(role: RoleKey, raw: string): void {
    const n = clampRoleCount(Number(raw))
    this.roleSlots = { ...this.roleSlots, [role]: n }
    this.selectedTemplateType = detectTemplateFromRoles(this.roleSlots)
  }

  protected roleCount(role: RoleKey): number {
    return this.roleSlots[role] ?? 0
  }

  protected submit(): void {
    this.ref.close({
      templateType: this.selectedTemplateType,
      roleSlots: normalizeRoleSlots(this.roleSlots),
    })
  }
}
