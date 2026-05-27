import { Component, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import { saisonWorkspacePath } from '../../core/navigation/troupe-routes'

@Component({
  selector: 'app-season-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
})
export class SeasonCard {
  readonly title = input.required<string>()
  readonly slug = input.required<string>()
  readonly eventCount = input.required<number>()
  readonly participantCount = input.required<number>()
  readonly archived = input(false)

  protected workspaceLink(slug: string): string[] {
    return saisonWorkspacePath(slug)
  }

  protected spectacleLabel(count: number): string {
    return count === 1 ? '1 spectacle' : `${count} spectacles`
  }

  protected participantLabel(count: number): string {
    return count === 1 ? '1 participant' : `${count} participants`
  }
}
