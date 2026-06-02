import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-filter-trigger',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './filter-trigger.html',
  styleUrl: './filter-trigger.scss',
})
export class FilterTrigger {
  readonly visible = input(false)
  readonly activeCount = input(0)
  readonly warn = input(false)
  readonly expanded = input(false)

  readonly open = output<void>()

  protected readonly ariaLabel = computed(() => {
    const count = this.activeCount()
    if (count > 0) {
      return `Filtrer, ${count} critère${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`
    }
    return 'Filtrer'
  })

  protected onOpen(): void {
    this.open.emit()
  }
}
