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
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'

import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import { compareFrenchDisplayName } from '../../core/text/french-collator'
import {
  type TroupeBaselineRole,
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import { AddMemberDialog, type AddMemberDialogData } from './add-member-dialog'
import {
  EditTroupeMemberDialog,
  type EditTroupeMemberDialogData,
} from './edit-troupe-member-dialog'
import {
  ConvertMemberExterneDialog,
  type ConvertMemberExterneDialogData,
} from './convert-member-externe-dialog'
import { ImportResultsDialog, type ImportResultsDialogData } from './import-results-dialog'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

@Component({
  selector: 'app-membres-tab',
  imports: [
    MatButtonModule,
    MatChipsModule,
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
  readonly profileSeasonId = input('')
  readonly profileSeasonSlug = input('')

  readonly membersChanged = output<void>()

  private readonly api = inject(TroupeApiService)
  private readonly memberProfile = inject(MemberProfileService)
  private readonly dialog = inject(MatDialog)
  private readonly snack = inject(MatSnackBar)

  protected readonly members = signal<TroupeMemberAdmin[]>([])
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly searchQuery = signal('')
  protected readonly debouncedSearch = signal('')
  protected readonly showInactive = signal(false)
  protected readonly roleFilter = signal<'ALL' | TroupeBaselineRole>('ALL')
  protected readonly roleMenuMember = signal<TroupeMemberAdmin | null>(null)

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  protected readonly filteredMembers = computed(() => {
    const q = this.debouncedSearch().trim().toLowerCase()
    let list = this.members()
    if (!this.showInactive()) {
      list = list.filter((m) => m.status === 'ACTIVE')
    }
    const roleFilter = this.roleFilter()
    if (roleFilter !== 'ALL') {
      list = list.filter((m) => m.baselineRole === roleFilter)
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
    if (role === 'TROUPE_ADMIN') return 'Administrateur·ice'
    if (role === 'EXTERNE') return 'Externe'
    return 'Membre'
  }

  protected setRoleFilter(filter: 'ALL' | TroupeBaselineRole): void {
    this.roleFilter.set(filter)
  }

  protected isExterne(member: TroupeMemberAdmin): boolean {
    return member.baselineRole === 'EXTERNE'
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

  protected clearSearch(): void {
    this.searchQuery.set('')
    this.debouncedSearch.set('')
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = null
    }
  }

  protected openEditMember(member: TroupeMemberAdmin): void {
    const ref = this.dialog.open<EditTroupeMemberDialog, EditTroupeMemberDialogData, boolean>(
      EditTroupeMemberDialog,
      {
        data: { troupeId: this.troupeId(), member },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.snack.open(
          this.isExterne(member) ? 'Externe mis à jour.' : 'Membre mis à jour.',
          'OK',
          { duration: 4000 },
        )
        void this.reload()
        this.membersChanged.emit()
      }
    })
  }

  protected openRoleMenu(member: TroupeMemberAdmin): void {
    this.roleMenuMember.set(member)
  }

  protected roleMenuTooltip(member: TroupeMemberAdmin): string {
    if (this.isLastAdmin(member)) {
      return 'La troupe doit conserver au moins un administrateur actif.'
    }
    if (member.status !== 'ACTIVE') {
      return 'Réactivez cette personne pour modifier son rôle.'
    }
    return 'Changer le rôle dans la troupe'
  }

  protected async selectRole(role: TroupeBaselineRole): Promise<void> {
    const member = this.roleMenuMember()
    this.roleMenuMember.set(null)
    if (!member || role === member.baselineRole || this.isLastAdmin(member)) {
      return
    }
    if (role === 'EXTERNE') {
      this.openConvertToExterne(member)
      return
    }
    if (this.isExterne(member)) {
      if (role === 'MEMBER') {
        this.reintegrerCommeMembre(member)
      }
      return
    }
    await this.onRoleChange(member, role)
  }

  protected async onRoleChange(
    member: TroupeMemberAdmin,
    role: TroupeBaselineRole,
  ): Promise<void> {
    if (role === 'EXTERNE' || role === member.baselineRole || this.isLastAdmin(member)) {
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

  protected openConvertToExterne(member: TroupeMemberAdmin): void {
    const ref = this.dialog.open<ConvertMemberExterneDialog, ConvertMemberExterneDialogData, boolean>(
      ConvertMemberExterneDialog,
      {
        data: { troupeId: this.troupeId(), member },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.snack.open('Membre passé en externe.', 'OK', { duration: 4000 })
        void this.reload()
        this.membersChanged.emit()
      }
    })
  }

  protected reintegrerCommeMembre(member: TroupeMemberAdmin): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Réintégrer comme membre ?',
        message:
          "Cette personne redevient membre de la troupe et sera resynchronisée sur les saisons actives (sauf retraits admin).",
        confirmLabel: 'Réintégrer',
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.confirmReintegrate(member)
      }
    })
  }

  private async confirmReintegrate(member: TroupeMemberAdmin): Promise<void> {
    this.saving.set(true)
    try {
      const r = await this.api.convertExterneToMember(this.troupeId(), member.id)
      if (!r.ok) {
        this.snack.open(
          r.errorMessage ?? this.errorMessage(r.status, 'Réintégration impossible.'),
          'OK',
          { duration: 5000 },
        )
        return
      }
      this.snack.open('Externe réintégré comme membre.', 'OK', { duration: 4000 })
      void this.reload()
      this.membersChanged.emit()
    } finally {
      this.saving.set(false)
    }
  }

  protected retirerMembre(member: TroupeMemberAdmin): void {
    if (member.status !== 'ACTIVE' || this.isLastAdmin(member) || this.saving()) {
      return
    }
    const isExterne = this.isExterne(member)
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: isExterne ? 'Retirer cet externe du carnet ?' : 'Retirer ce membre de la troupe ?',
        message: isExterne
          ? "Cette action retire l'externe du carnet de la troupe. L'historique des spectacles est conservé."
          : "Cette action retire le membre de la troupe et lui enlève l'accès associé. Son compte HatCast n'est pas supprimé.",
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
      this.snack.open(
        this.isExterne(member) ? 'Externe retiré du carnet.' : 'Membre retiré de la troupe.',
        'OK',
        { duration: 4000 },
      )
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
        return compareFrenchDisplayName(a.displayName, b.displayName)
      })
      this.members.set(sorted)
    } finally {
      this.loading.set(false)
    }
  }

  protected openMemberProfile(member: TroupeMemberAdmin): void {
    const seasonId = this.profileSeasonId()
    if (!seasonId || !member.userSlug) {
      return
    }
    this.memberProfile.navigateToMemberGlance({
      userSlug: member.userSlug,
      troupeId: this.troupeId(),
      seasonId: seasonId,
    })
  }

  private errorMessage(status: number, fallback: string): string {
    if (status === 404) return 'Ressource introuvable.'
    if (status === 409) return 'La troupe doit conserver au moins un administrateur actif.'
    if (status === 403) return 'Vous ne pouvez pas administrer les membres de cette troupe.'
    return fallback
  }
}
