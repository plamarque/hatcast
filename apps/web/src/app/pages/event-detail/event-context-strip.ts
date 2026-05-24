import { Component, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-event-context-strip',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './event-context-strip.html',
  styleUrl: './event-context-strip.scss',
})
export class EventContextStrip {
  readonly troupeName = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly leagueTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly showTroupeLink = input(false)
}
