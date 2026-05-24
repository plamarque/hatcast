import { Component, input } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-event-equipe-empty',
  imports: [MatIconModule],
  templateUrl: './event-equipe-empty.html',
  styleUrl: './event-equipe-empty.scss',
})
export class EventEquipeEmpty {
  /** Deep link `showConfirm=true` — participation UI deferred to story 6.7. */
  readonly showConfirmPending = input(false)
}
