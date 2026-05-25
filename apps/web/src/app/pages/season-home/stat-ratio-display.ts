import { Component, computed, input } from '@angular/core'

import { formatStatCell, type StatCounts } from './season-statistics.utils'

@Component({
  selector: 'app-stat-ratio-display',
  template: `
    @if (!cell().empty) {
      <div class="stat-ratio" [attr.title]="cell().tooltip">
        <span class="stat-ratio__line">
          <span class="stat-ratio__sel">{{ cell().ratio.split('/')[0] }}</span>
          <span class="stat-ratio__denom">/{{ cell().ratio.split('/')[1] }}</span>
        </span>
        @if (cell().percent) {
          <span class="stat-ratio__pct">{{ cell().percent }}</span>
        }
      </div>
    } @else {
      <span class="stat-ratio stat-ratio--empty" [attr.title]="cell().tooltip">—</span>
    }
  `,
  styles: `
    .stat-ratio {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.2;
      width: 100%;
    }
    .stat-ratio__sel {
      font-weight: 700;
    }
    .stat-ratio__denom {
      font-weight: 400;
      opacity: 0.85;
    }
    .stat-ratio__pct {
      font-size: 0.75rem;
      opacity: 0.75;
    }
    .stat-ratio--empty {
      opacity: 0.5;
    }
    :host(.stat-ratio--month) .stat-ratio__sel,
    :host(.stat-ratio--month) .stat-ratio__denom {
      color: var(--mat-sys-primary, #5c6bc0);
    }
  `,
})
export class StatRatioDisplay {
  readonly counts = input<StatCounts | undefined>()
  readonly monthVariant = input(false)

  protected readonly cell = computed(() => formatStatCell(this.counts()))
}
