import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelect, MatSelectModule } from '@angular/material/select'

import {
  applyTemplate,
  detectTemplateFromRoles,
  type EventTypeId,
  EVENT_TYPE_IDS,
  getEventTypeIcon,
  getEventTypeLabel,
  normalizeRoleSlots,
  ROLE_COUNT_MAX,
  roleSlotsEqual,
  type RoleSlots,
  TEMPLATE_DISPLAY_ORDER,
} from '../../core/events/event-types'
import {
  RoleSlotChipSet,
  type RoleSlotCountChange,
} from '../../shared/event-roles/role-slot-chip-set/role-slot-chip-set'

export const FORMAT_AND_ROLES_HELP =
  'Format du spectacle et effectifs par rôle nécessaires pour composer l’équipe.'

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
    MatSelectModule,
    RoleSlotChipSet,
  ],
  templateUrl: './event-type-roles-dialog.html',
  styleUrl: './event-type-roles-dialog.scss',
})
export class EventTypeRolesDialog implements OnInit {
  protected readonly roleCountMax = ROLE_COUNT_MAX
  protected readonly helpText = FORMAT_AND_ROLES_HELP
  private readonly ref = inject(MatDialogRef<EventTypeRolesDialog, EventTypeRolesDialogResult>)
  protected readonly data = inject<EventTypeRolesDialogData>(MAT_DIALOG_DATA)

  @ViewChild('formatSelect') private formatSelect?: MatSelect

  protected showTemplateChangeConfirmation = false
  protected pendingTemplateId: EventTypeId | null = null

  protected readonly templateOrder = TEMPLATE_DISPLAY_ORDER
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
  }

  protected cancelTemplateChange(): void {
    this.showTemplateChangeConfirmation = false
    this.pendingTemplateId = null
    queueMicrotask(() => {
      this.formatSelect?.writeValue(this.selectedTemplateType)
    })
  }

  protected onSlotCountChange(change: RoleSlotCountChange): void {
    this.roleSlots = { ...this.roleSlots, [change.key]: change.count }
  }

  protected submit(): void {
    this.ref.close({
      templateType: this.selectedTemplateType,
      roleSlots: normalizeRoleSlots(this.roleSlots),
    })
  }
}
