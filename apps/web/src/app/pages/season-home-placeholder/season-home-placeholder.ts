import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

/** Placeholder story 3.2 — spectacles et agenda dans la saison. */
@Component({
  selector: 'app-season-home-placeholder',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './season-home-placeholder.html',
  styleUrl: './season-home-placeholder.scss',
})
export class SeasonHomePlaceholder {
  private readonly route = inject(ActivatedRoute)

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )
}
