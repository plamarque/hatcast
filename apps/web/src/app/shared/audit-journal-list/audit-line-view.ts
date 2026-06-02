import { Component, HostListener, input, signal } from '@angular/core'

import type {
  AuditActorBadgeMode,
  AuditLineViewModel,
  AuditPersonView,
  AuditPillTone,
  AuditVisualPill,
} from '../../core/audit/audit-line-view-model'
import { UserAvatarComponent } from '../user-avatar/user-avatar'

@Component({
  selector: 'app-audit-line-view',
  imports: [UserAvatarComponent],
  templateUrl: './audit-line-view.html',
  styleUrl: './audit-line-view.scss',
})
export class AuditLineView {
  readonly line = input.required<AuditLineViewModel>()

  protected readonly actorPopoverOpen = signal(false)

  @HostListener('document:click')
  protected closeActorPopover(): void {
    this.actorPopoverOpen.set(false)
  }

  @HostListener('document:keydown.escape')
  protected closeActorPopoverOnEscape(): void {
    this.actorPopoverOpen.set(false)
  }

  @HostListener('document:scroll')
  protected closeActorPopoverOnScroll(): void {
    this.actorPopoverOpen.set(false)
  }

  protected pillClass(tone: AuditPillTone): string {
    return `audit-pill audit-pill--${tone}`
  }

  protected trackPill(pill: AuditVisualPill): string {
    return `${pill.tone}:${pill.text}`
  }

  protected toggleActorPopover(event: Event): void {
    event.stopPropagation()
    this.actorPopoverOpen.update((open) => !open)
  }

  protected actorPopoverFlipped(line: AuditLineViewModel): boolean {
    if (!line.showActorBadge || line.showSubject) {
      return false
    }
    return line.transition != null || line.pills.length > 0
  }

  protected actorPopoverLead(mode: AuditActorBadgeMode | null): string {
    if (mode === 'proxy') {
      return 'Action effectuée par un organisateur'
    }
    return 'Action effectuée par'
  }

  protected actorAriaLabel(actor: AuditPersonView, mode: AuditActorBadgeMode | null): string {
    if (mode === 'proxy') {
      return `Action effectuée par un organisateur : ${actor.displayName}. Appuyer pour afficher le détail.`
    }
    return `Action effectuée par ${actor.displayName}. Appuyer pour afficher le détail.`
  }
}
