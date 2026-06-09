import { Component, inject, input, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  TroupeApiService,
  type TroupeCategory,
} from '../../core/troupes/troupe-api.service'
import {
  defaultCategoryLabelFromGlossary,
  isDefaultCategorySlug,
} from '../event-detail/event-category.constants'
import {
  TroupeCategoryDeleteDialog,
  type TroupeCategoryDeleteDialogResult,
} from './troupe-category-delete-dialog'
import {
  TroupeCategoryFormDialog,
  type TroupeCategoryFormDialogResult,
} from './troupe-category-form-dialog'

@Component({
  selector: 'app-troupe-categories-tab',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './troupe-categories-tab.html',
  styleUrl: './troupe-categories-tab.scss',
})
export class TroupeCategoriesTab implements OnInit {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly dialog = inject(MatDialog)
  private readonly snack = inject(MatSnackBar)

  readonly troupeId = input.required<string>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly categories = signal<TroupeCategory[]>([])

  async ngOnInit(): Promise<void> {
    await this.reload()
  }

  protected async openCreate(): Promise<void> {
    const ref = this.dialog.open(TroupeCategoryFormDialog, {
      data: { mode: 'create', troupeId: this.troupeId() },
      width: 'min(24rem, 100vw - 2rem)',
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeCategoryFormDialogResult
      | undefined
    if (!result?.ok) return
    this.snack.open('Catégorie créée', 'OK', { duration: 4000 })
    await this.reload()
  }

  protected async openEdit(category: TroupeCategory): Promise<void> {
    const ref = this.dialog.open(TroupeCategoryFormDialog, {
      data: { mode: 'edit', troupeId: this.troupeId(), category },
      width: 'min(24rem, 100vw - 2rem)',
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeCategoryFormDialogResult
      | undefined
    if (!result?.ok) return
    this.snack.open('Catégorie enregistrée', 'OK', { duration: 4000 })
    await this.reload()
  }

  protected isDefaultCategory(category: TroupeCategory): boolean {
    return isDefaultCategorySlug(category.slug)
  }

  protected async openDelete(category: TroupeCategory): Promise<void> {
    const ref = this.dialog.open(TroupeCategoryDeleteDialog, {
      data: {
        troupeId: this.troupeId(),
        slug: category.slug,
        label: category.label,
        defaultCategoryLabel: defaultCategoryLabelFromGlossary(this.categories()),
      },
      width: 'min(24rem, 100vw - 2rem)',
      disableClose: true,
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeCategoryDeleteDialogResult
      | undefined
    if (!result) return
    if (!result.ok) {
      this.snack.open(result.message, 'OK', { duration: 6000 })
      return
    }
    this.snack.open('Catégorie supprimée', 'OK', { duration: 4000 })
    await this.reload()
  }

  private async reload(): Promise<void> {
    this.loading.set(true)
    this.loadError.set(false)
    const result = await this.troupeApi.listCategories(this.troupeId())
    this.loading.set(false)
    if (!result.ok || !result.data) {
      this.loadError.set(true)
      this.categories.set([])
      return
    }
    this.categories.set(result.data)
  }
}
