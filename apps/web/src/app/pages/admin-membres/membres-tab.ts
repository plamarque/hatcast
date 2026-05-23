import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'

import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import {
  type TroupeBaselineRole,
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
import { AddMemberDialog, type AddMemberDialogData } from './add-member-dialog'
import { ImportResultsDialog, type ImportResultsDialogData } from './import-results-dialog'

@Component({
  selector: 'app-membres-tab',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    UserAvatarComponent,
  ],
  templateUrl: './membres-tab.html',
  styleUrl: './membres-tab.scss',
})
export class MembresTab implements OnInit, OnDestroy {
  readonly troupeId = input.required<string>()
  readonly seasonId = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly canManageSeasonOrganizers = input(false)

  readonly membersChanged = output<void>()

  private readonly api = inject(TroupeApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly memberProfile = inject(MemberProfileService)
  private readonly dialog = inject(MatDialog)
  private readonly snack = inject(MatSnackBar)

  protected readonly members = signal<TroupeMemberAdmin[]>([])
  protected readonly seasonOrganizerUserIds = signal<Set<string> | null>(null)
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly searchQuery = signal('')
  protected readonly debouncedSearch = signal('')
  protected readonly showInactive = signal(false)
  protected readonly editingMemberId = signal<string | null>(null)
  protected readonly editingName = signal('')
  protected readonly roleMenuMember = signal<TroupeMemberAdmin | null>(null)

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  protected readonly filteredMembers = computed(() => {
    const q = this.debouncedSearch().trim().toLowerCase()
    let list = this.members()
    if (!this.showInactive()) {
      list = list.filter((m) => m.status === 'ACTIVE')
    }
    if (q) {
      list = list.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
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

  protected avatarInitial(member: TroupeMemberAdmin): string {
    const name = member.displayName.trim()
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  protected roleLabel(role: TroupeBaselineRole): string {
    return role === 'TROUPE_ADMIN' ? 'Administrateur·ice' : 'Membre'
  }

  protected isLastAdmin(member: TroupeMemberAdmin): boolean {
    if (member.baselineRole !== 'TROUPE_ADMIN' || member.status !== 'ACTIVE') {
      return false
    }
    const activeAdmins = this.members().filter(
      (m) => m.baselineRole === 'TROUPE_ADMIN' && m.status === 'ACTIVE',
    )
    return activeAdmins.length === 1 && activeAdmins[0].id === member.id
  }

  protected canNommerOrganisateur(member: TroupeMemberAdmin): boolean {
    return (
      this.canManageSeasonOrganizers() &&
      member.status === 'ACTIVE' &&
      this.seasonOrganizerUserIds() !== null &&
      !this.seasonOrganizerUserIds()!.has(member.userId)
    )
  }

  protected clearSearch(): void {
    this.searchQuery.set('')
    this.debouncedSearch.set('')
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = null
    }
  }

  protected startNameEdit(member: TroupeMemberAdmin): void {
    this.editingMemberId.set(member.id)
    this.editingName.set(member.displayName)
  }

  protected cancelNameEdit(): void {
    this.editingMemberId.set(null)
    this.editingName.set('')
  }

  protected onNameKeydown(event: KeyboardEvent, member: TroupeMemberAdmin): void {
    if (event.key === 'Enter') {
      event.preventDefault()
      void this.saveDisplayName(member)
    } else if (event.key === 'Escape') {
      this.cancelNameEdit()
    }
  }

  protected async saveDisplayName(member: TroupeMemberAdmin): Promise<void> {
    if (this.editingMemberId() !== member.id) {
      return
    }
    const next = this.editingName().trim()
    this.editingMemberId.set(null)
    if (!next || next === member.displayName) {
      return
    }
    await this.patchMember(member, { displayName: next })
  }

  protected openRoleMenu(member: TroupeMemberAdmin): void {
    this.roleMenuMember.set(member)
  }

  protected async selectRole(role: TroupeBaselineRole): Promise<void> {
    const member = this.roleMenuMember()
    if (!member) return
    await this.onRoleChange(member, role)
    this.roleMenuMember.set(null)
  }

  protected async onRoleChange(
    member: TroupeMemberAdmin,
    role: TroupeBaselineRole,
  ): Promise<void> {
    if (role === member.baselineRole || this.isLastAdmin(member)) {
      return
    }
    await this.patchMember(member, { baselineRole: role })
  }

  protected async onActiveToggle(member: TroupeMemberAdmin, active: boolean): Promise<void> {
    if (this.isLastAdmin(member) && !active) {
      return
    }
    const nextStatus = active ? 'ACTIVE' : 'INACTIVE'
    if (nextStatus === member.status) {
      return
    }
    await this.patchMember(member, { status: nextStatus })
  }

  protected retirerMembre(member: TroupeMemberAdmin): void {
    if (member.status !== 'ACTIVE' || this.isLastAdmin(member) || this.saving()) {
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Retirer ce membre de la troupe ?',
        message:
          "Cette action retire le membre de la troupe et lui enlève l'accès associé. Son compte HatCast n'est pas supprimé.",
        confirmLabel: 'Retirer',
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.confirmRetirerMembre(member)
      }
    })
  }

  protected async nommerOrganisateur(member: TroupeMemberAdmin): Promise<void> {
    const email = member.email
    if (!email) {
      this.snack.open('Email indisponible pour ce membre.', 'OK', { duration: 4000 })
      return
    }
    this.saving.set(true)
    try {
      const r = await this.organizerApi.addSeasonOrganizer(this.seasonId(), email)
      if (!r.ok) {
        this.snack.open(
          r.status === 404 ? 'Utilisateur introuvable.' : 'Ajout impossible.',
          'OK',
          { duration: 5000 },
        )
        return
      }
      this.snack.open('Organisateur·ice de saison ajouté·e.', 'OK', { duration: 4000 })
      await this.loadSeasonOrganizers()
    } finally {
      this.saving.set(false)
    }
  }

  protected openAddMember(): void {
    const ref = this.dialog.open<AddMemberDialog, AddMemberDialogData, boolean>(AddMemberDialog, {
      data: { troupeId: this.troupeId() },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.snack.open('Membre ajouté.', 'OK', { duration: 4000 })
        void this.reload()
        this.membersChanged.emit()
      }
    })
  }

  protected async exportCsv(): Promise<void> {
    this.saving.set(true)
    try {
      const r = await this.api.exportMembersCsv(this.troupeId())
      if (!r.ok || !r.data) {
        this.snack.open(this.errorMessage(r.status, 'Export CSV impossible.'), 'OK', {
          duration: 5000,
        })
        return
      }
      const url = URL.createObjectURL(r.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `troupe-members-${this.troupeId()}.csv`
      anchor.click()
      URL.revokeObjectURL(url)
      this.snack.open('Export téléchargé', 'OK', { duration: 3000 })
    } finally {
      this.saving.set(false)
    }
  }

  protected async onImportUsersFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    await this.runImport(() => this.api.importUsersCsv(this.troupeId(), file))
  }

  protected async onImportMembersFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    await this.runImport(() => this.api.importMembersCsv(this.troupeId(), file))
  }

  private async runImport(
    call: () => ReturnType<TroupeApiService['importMembersCsv']>,
  ): Promise<void> {
    this.saving.set(true)
    try {
      const r = await call()
      if (!r.ok || !r.data) {
        this.snack.open(this.errorMessage(r.status, 'Import impossible.'), 'OK', { duration: 5000 })
        return
      }
      const refreshOnClose = r.data.summary.success > 0
      this.dialog
        .open<ImportResultsDialog, ImportResultsDialogData, boolean>(ImportResultsDialog, {
          data: { result: r.data, refreshOnClose },
          disableClose: refreshOnClose,
          width: 'min(100vw - 2rem, 44rem)',
        })
        .afterClosed()
        .subscribe((shouldRefresh) => {
          if (shouldRefresh || refreshOnClose) {
            void this.reload()
            this.membersChanged.emit()
          }
        })
    } finally {
      this.saving.set(false)
    }
  }

  private async patchMember(
    member: TroupeMemberAdmin,
    patch: { displayName?: string; status?: TroupeMemberAdmin['status']; baselineRole?: TroupeBaselineRole },
  ): Promise<void> {
    const previous = { ...member }
    this.applyOptimistic(member.id, patch)
    this.saving.set(true)
    try {
      const r = await this.api.updateMember(this.troupeId(), member.id, patch)
      if (!r.ok) {
        this.revertMember(previous)
        this.snack.open(this.errorMessage(r.status, 'Enregistrement impossible'), 'OK', {
          duration: 5000,
        })
        return
      }
      this.membersChanged.emit()
      await this.reload()
    } catch {
      this.revertMember(previous)
      this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
    } finally {
      this.saving.set(false)
    }
  }

  private async confirmRetirerMembre(member: TroupeMemberAdmin): Promise<void> {
    const previous = { ...member }
    this.applyOptimistic(member.id, { status: 'INACTIVE' })
    this.saving.set(true)
    try {
      const r = await this.api.deactivateMember(this.troupeId(), member.id)
      if (!r.ok) {
        this.revertMember(previous)
        this.snack.open(this.errorMessage(r.status, 'Retrait impossible'), 'OK', {
          duration: 5000,
        })
        return
      }
      this.snack.open('Membre retiré de la troupe.', 'OK', { duration: 4000 })
      this.membersChanged.emit()
      await this.reload()
    } catch {
      this.revertMember(previous)
      this.snack.open('Retrait impossible', 'OK', { duration: 5000 })
    } finally {
      this.saving.set(false)
    }
  }

  private applyOptimistic(
    memberId: string,
    patch: Partial<Pick<TroupeMemberAdmin, 'displayName' | 'status' | 'baselineRole'>>,
  ): void {
    this.members.update((list) =>
      list.map((m) => (m.id === memberId ? { ...m, ...patch } : m)),
    )
  }

  private revertMember(previous: TroupeMemberAdmin): void {
    this.members.update((list) =>
      list.map((m) => (m.id === previous.id ? previous : m)),
    )
  }

  private async reload(): Promise<void> {
    this.loading.set(true)
    try {
      const r = await this.api.listMembers(this.troupeId(), 0, 100)
      if (!r.ok || !r.data) {
        this.snack.open('Chargement des membres impossible.', 'OK', { duration: 5000 })
        return
      }
      const sorted = [...r.data.content].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'ACTIVE' ? -1 : 1
        }
        return a.displayName.localeCompare(b.displayName, 'fr')
      })
      this.members.set(sorted)
      if (this.canManageSeasonOrganizers()) {
        await this.loadSeasonOrganizers()
      }
    } finally {
      this.loading.set(false)
    }
  }

  private async loadSeasonOrganizers(): Promise<void> {
    this.seasonOrganizerUserIds.set(null)
    const r = await this.organizerApi.listSeasonOrganizers(this.seasonId())
    if (r.ok && r.data) {
      this.seasonOrganizerUserIds.set(new Set(r.data.map((o) => o.userId)))
    }
  }

  protected openMemberProfile(userId: string): void {
    this.memberProfile.openProfileDialog({
      seasonId: this.seasonId(),
      troupeId: this.troupeId(),
      userId,
      seasonSlug: this.seasonSlug(),
    })
  }

  private errorMessage(status: number, fallback: string): string {
    if (status === 404) return 'Ressource introuvable.'
    if (status === 409) return 'La troupe doit conserver au moins un administrateur actif.'
    if (status === 403) return 'Vous ne pouvez pas administrer les membres de cette troupe.'
    return fallback
  }
}
