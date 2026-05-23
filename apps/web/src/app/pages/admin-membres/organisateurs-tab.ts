import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'

import {
  OrganizerApiService,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import {
  AddOrganizerDialog,
  type AddOrganizerDialogData,
} from './add-organizer-dialog'

@Component({
  selector: 'app-organisateurs-tab',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './organisateurs-tab.html',
  styleUrl: './organisateurs-tab.scss',
})
export class OrganisateursTab implements OnInit, OnDestroy {
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()

  private readonly api = inject(OrganizerApiService)
  private readonly dialog = inject(MatDialog)
  private readonly snack = inject(MatSnackBar)

  protected readonly organizers = signal<OrganizerResponse[]>([])
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly searchQuery = signal('')
  protected readonly debouncedSearch = signal('')

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  protected readonly filteredOrganizers = computed(() => {
    const q = this.debouncedSearch().trim().toLowerCase()
    const list = this.organizers()
    if (!q) {
      return list
    }
    return list.filter(
      (o) =>
        (o.displayName?.toLowerCase().includes(q) ?? false) ||
        o.email.toLowerCase().includes(q),
    )
  })

  ngOnInit(): void {
    void this.reload()
  }

  ngOnDestroy(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value)
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedSearch.set(value)
    }, 150)
  }

  protected clearSearch(): void {
    this.searchQuery.set('')
    this.debouncedSearch.set('')
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = null
    }
  }

  protected displayLabel(organizer: OrganizerResponse): string {
    return organizer.displayName || organizer.email
  }

  protected openAddOrganizer(): void {
    const ref = this.dialog.open<AddOrganizerDialog, AddOrganizerDialogData, boolean>(
      AddOrganizerDialog,
      {
        data: { seasonId: this.seasonId(), troupeId: this.troupeId() },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.snack.open('Organisateur·ice ajouté·e.', 'OK', { duration: 4000 })
        void this.reload()
      }
    })
  }

  protected confirmRemove(organizer: OrganizerResponse): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Retirer l’organisateur·ice',
        message: `Retirer « ${this.displayLabel(organizer)} » des organisateur·ices de saison ?`,
        confirmLabel: 'Retirer',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) void this.removeOrganizer(organizer.userId)
    })
  }

  private async removeOrganizer(userId: string): Promise<void> {
    this.saving.set(true)
    try {
      const r = await this.api.removeSeasonOrganizer(this.seasonId(), userId)
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      this.snack.open('Organisateur·ice retiré·e.', 'OK', { duration: 4000 })
      await this.reload()
    } finally {
      this.saving.set(false)
    }
  }

  private async reload(): Promise<void> {
    this.loading.set(true)
    try {
      const r = await this.api.listSeasonOrganizers(this.seasonId())
      if (r.ok && r.data) {
        this.organizers.set(r.data)
      } else {
        this.snack.open('Chargement impossible.', 'OK', { duration: 5000 })
      }
    } finally {
      this.loading.set(false)
    }
  }
}
