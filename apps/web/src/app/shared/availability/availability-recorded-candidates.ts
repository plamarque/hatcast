import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import type { SummaryRoleCandidate } from '../../core/availability/availability-api.service'
import type { CompositionPoolPreviewSegment } from '../../core/composition/composition-api.service'
import { CompositionPoolPreview } from '../composition/composition-pool-preview'
import { selectionBackground } from './availability-selection-colors'
import { UserAvatarComponent } from '../user-avatar/user-avatar'

/** Preserve the shared chance badges; missing recorded values get a neutral badge. */
@Component({
  selector: 'app-availability-recorded-candidates',
  imports: [CompositionPoolPreview, MatButtonModule, UserAvatarComponent],
  template: `
    @if (pool().length) {
      <app-composition-pool-preview [dispos]="true" [pool]="pool()" [interactive]="interactive()" (segmentTap)="segmentTap.emit($event)" />
    }
    @for (candidate of missingRecorded(); track candidate.participantId) {
      <button mat-button type="button" class="recorded-missing" [class.recorded-missing--assigned]="candidate.publishedAssignment" [style.background]="candidate.publishedAssignment ? selectionBackground(candidate.participationStatus) : 'var(--mat-sys-surface-container-highest)'" [disabled]="!interactive() || !candidate.publishedAssignment"
        [attr.aria-label]="candidate.publishedAssignment ? 'Voir la fiche de sélection de ' + candidate.displayName + ', capture des chances indisponible' : candidate.displayName + ', capture indisponible'"
        (click)="segmentTap.emit({ participantId: candidate.participantId, chancePercent: null })">
        <app-user-avatar [displayName]="candidate.displayName" [avatarUrl]="candidate.avatarUrl ?? null" [gender]="candidate.gender ?? null" [size]="20" />
        <span class="recorded-missing__label">{{ candidate.displayName }}</span>
      </button>
    }
  `,
  styles: [`
    .recorded-missing { min-height: 3rem; min-width: 3rem; margin: .2rem .2rem 0 0; padding: .28rem .4rem;
      border-radius: .4rem; font: var(--mat-sys-label-medium); }
    .recorded-missing.mat-mdc-button, .recorded-missing.mat-mdc-button:disabled {
      color: var(--mat-sys-on-surface);
      --mdc-text-button-disabled-label-text-color: var(--mat-sys-on-surface);
    }
    .recorded-missing--assigned.mat-mdc-button, .recorded-missing--assigned.mat-mdc-button:disabled {
      color: #fff;
      --mdc-text-button-disabled-label-text-color: #fff;
    }
    .recorded-missing--assigned .recorded-missing__label {
      background: color-mix(in srgb, var(--mat-sys-scrim) 70%, transparent);
      border-radius: .3rem; padding: .1rem .3rem;
    }
  `],
})
export class AvailabilityRecordedCandidates {
  protected readonly selectionBackground = selectionBackground
  readonly candidates = input.required<SummaryRoleCandidate[]>()
  readonly interactive = input(false)
  readonly segmentTap = output<{ participantId: string; chancePercent: number | null }>()
  protected readonly pool = computed<CompositionPoolPreviewSegment[]>(() => this.candidates().filter(c => c.chancePercent != null).map(c => ({
    participantId: c.participantId, displayName: c.displayName, chancePercent: c.chancePercent!, weight: c.chancePercent!,
    avatarUrl: c.avatarUrl ?? null, gender: c.gender,
    participationStatus: c.publishedAssignment ? (c.participationStatus ?? 'selected') : null,
  })))
  protected readonly missingRecorded = computed(() => this.candidates().filter(c => c.chancePercent == null))
}
