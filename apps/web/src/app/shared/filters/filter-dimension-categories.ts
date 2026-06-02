import { Component, computed, input, output } from '@angular/core'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'

import {
  PRINCIPAL_CATEGORY,
  allCategorySlugs,
  isSlugSelected,
  toggleAllCategories,
  toggleCategorySlug,
  type StatsCategoryFilter,
} from '../../pages/season-home/stats-categories'

@Component({
  selector: 'app-filter-dimension-categories',
  imports: [MatCheckboxModule, MatIconModule],
  templateUrl: './filter-dimension-categories.html',
  styleUrl: './filter-dimension-categories.scss',
})
export class FilterDimensionCategories {
  readonly value = input<StatsCategoryFilter>({ kind: 'all' })
  readonly glossarySlugs = input<string[]>([])
  readonly labels = input<Record<string, string>>({})

  readonly valueChange = output<StatsCategoryFilter>()

  protected readonly allSlugs = computed(() => allCategorySlugs(this.glossarySlugs()))

  protected isAllSelected(): boolean {
    return this.value().kind === 'all'
  }

  protected isChecked(slug: string): boolean {
    return isSlugSelected(this.value(), slug)
  }

  protected principalLabel(): string {
    return 'Spectacles ordinaires'
  }

  protected glossaryLabel(slug: string): string {
    return this.labels()[slug] ?? slug
  }

  protected onToggleAll(checked: boolean): void {
    this.valueChange.emit(toggleAllCategories(this.value(), this.allSlugs(), checked))
  }

  protected onTogglePrincipal(checked: boolean): void {
    this.onToggleSlug(PRINCIPAL_CATEGORY, checked)
  }

  protected onToggleGlossarySlug(slug: string, checked: boolean): void {
    this.onToggleSlug(slug, checked)
  }

  private onToggleSlug(slug: string, checked: boolean): void {
    this.valueChange.emit(
      toggleCategorySlug(this.value(), this.allSlugs(), slug, checked),
    )
  }
}
