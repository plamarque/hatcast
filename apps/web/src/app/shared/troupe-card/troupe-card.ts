import { Component, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import { troupeHubPath } from '../../core/navigation/troupe-routes'

export type TroupeCardMode = 'mine' | 'discover'

@Component({
  selector: 'app-troupe-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './troupe-card.html',
  styleUrl: './troupe-card.scss',
})
export class TroupeCard {
  readonly name = input.required<string>()
  readonly slug = input.required<string>()
  readonly memberCount = input.required<number>()
  readonly upcomingCount = input.required<number>()
  readonly mode = input<TroupeCardMode>('mine')

  protected hubLink(slug: string): string[] {
    return troupeHubPath(slug)
  }

  protected memberLabel(count: number): string {
    return count === 1 ? '1 membre' : `${count} membres`
  }

  protected upcomingLabel(count: number): string {
    return count === 1 ? '1 spectacle à venir' : `${count} spectacles à venir`
  }
}
