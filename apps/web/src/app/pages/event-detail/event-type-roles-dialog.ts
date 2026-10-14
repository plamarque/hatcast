import { Component, inject, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'

import {
  applyTemplate,
  detectTemplateFromRoles,
  type EventTypeId,
  EVENT_TYPE_IDS,
  getEventTypeIcon,
  getEventTypeLabel,
  normalizeRoleSlots,
  roleSlotsEqual,
  type RoleSlots,
  TEMPLATE_DISPLAY_ORDER,
} from '../../core/events/event-types'

export const FORMAT_AND_ROLES_HELP =
  'Le format applique son modèle de besoins à la composition.'

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
  ],
  templateUrl: './event-type-roles-dialog.html',
  styleUrl: './event-type-roles-dialog.scss',
})
export class EventTypeRolesDialog implements OnInit {
  protected readonly helpText = FORMAT_AND_ROLES_HELP
  private readonly ref = inject(MatDialogRef<EventTypeRolesDialog, EventTypeRolesDialogResult>)
  protected readonly data = inject<EventTypeRolesDialogData>(MAT_DIALOG_DATA)

  protected readonly templateOrder = TEMPLATE_DISPLAY_ORDER
  protected readonly getEventTypeIcon = getEventTypeIcon
  protected readonly getEventTypeLabel = getEventTypeLabel

  protected selectedTemplateType!: EventTypeId
  protected roleSlots!: RoleSlots
  private initialTemplateType!: EventTypeId

  ngOnInit(): void {
    const normalized = normalizeRoleSlots(this.data.roleSlots)
    const fromApi = this.data.templateType as EventTypeId
    this.selectedTemplateType = EVENT_TYPE_IDS.includes(fromApi)
      ? fromApi
      : detectTemplateFromRoles(normalized)
    this.initialTemplateType = this.selectedTemplateType
    this.roleSlots = normalized
  }

  protected onTemplateSelected(typeId: EventTypeId): void {
    this.selectedTemplateType = typeId
  }

  protected get hasSelectedTemplateChange(): boolean {
    return this.selectedTemplateType !== this.initialTemplateType
  }

  protected get shouldWarnAboutTemplateNeeds(): boolean {
    return (
      this.hasSelectedTemplateChange &&
      !roleSlotsEqual(this.roleSlots, applyTemplate(this.selectedTemplateType))
    )
  }

  protected submit(): void {
    if (!this.hasSelectedTemplateChange) return
    this.ref.close({
      templateType: this.selectedTemplateType,
      roleSlots: normalizeRoleSlots(applyTemplate(this.selectedTemplateType)),
    })
  }
}
