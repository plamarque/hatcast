import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { MembresTab } from './membres-tab'

describe('MembresTab', () => {
  async function setup(options: {
    confirmRemoval?: boolean
    deactivateResult?: { ok: boolean; status: number }
  } = {}) {
    const api = {
      listMembers: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          content: [
            {
              id: 'm1',
              userId: 'u1',
              email: 'admin@example.com',
              displayName: 'Admin',
              status: 'ACTIVE',
              baselineRole: 'TROUPE_ADMIN',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: 'm3',
              userId: 'u3',
              email: 'inactive@example.com',
              displayName: 'Inactif',
              status: 'INACTIVE',
              baselineRole: 'MEMBER',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: 'm2',
              userId: 'u2',
              email: 'member@example.com',
              displayName: 'Membre',
              status: 'ACTIVE',
              baselineRole: 'MEMBER',
              createdAt: '',
              updatedAt: '',
            },
          ],
          page: 0,
          size: 100,
          totalElements: 3,
          totalPages: 1,
        },
      }),
      updateMember: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { id: 'm1' } }),
      deactivateMember: vi.fn().mockResolvedValue(options.deactivateResult ?? { ok: true, status: 204 }),
      exportMembersCsv: vi.fn().mockResolvedValue({ ok: true, status: 200, data: new Blob(['email\n']) }),
      importMembersCsv: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          summary: { success: 1, skipped: 0, error: 0 },
          rows: [{ rowNumber: 2, outcome: 'SUCCESS', email: 'new@example.com', code: null, message: null }],
        },
      }),
      importUsersCsv: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          summary: { success: 1, skipped: 0, error: 0 },
          rows: [{ rowNumber: 2, outcome: 'SUCCESS', email: 'user@example.com', code: null, message: 'Compte créé' }],
        },
      }),
      addMember: vi.fn(),
    }
    const organizerApi = {
      listSeasonOrganizers: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      addSeasonOrganizer: vi.fn(),
    }
    const dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(options.confirmRemoval ?? false) }),
    }
    const snack = { open: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [MembresTab, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: OrganizerApiService, useValue: organizerApi },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snack },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(MembresTab)
    fixture.componentRef.setInput('troupeId', 't1')
    fixture.componentRef.setInput('seasonId', 's1')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return { fixture, api, dialog, snack }
  }

  it('hides inactive members by default and filters by search', async () => {
    const { fixture } = await setup()
    const cmp = fixture.componentInstance as MembresTab & {
      onSearchInput(q: string): void
      debouncedSearch: { set(v: string): void }
      showInactive: { set(v: boolean): void }
      filteredMembers: () => Array<{ displayName: string }>
    }

    expect(text(fixture)).toContain('Admin')
    expect(text(fixture)).not.toContain('inactive@example.com')

    cmp.showInactive.set(true)
    fixture.detectChanges()
    expect(text(fixture)).toContain('inactive@example.com')

    cmp.debouncedSearch.set('admin')
    fixture.detectChanges()
    expect(cmp.filteredMembers().length).toBe(1)
  })

  it('reverts on 409 conflict when updating role', async () => {
    const { fixture, api, snack } = await setup()
    api.updateMember.mockResolvedValueOnce({ ok: false, status: 409 })
    const cmp = fixture.componentInstance as MembresTab & {
      members: () => Array<{ id: string; baselineRole: string }>
      onRoleChange(m: unknown, role: string): Promise<void>
    }
    const member = cmp.members().find((m) => m.id === 'm2')!

    await cmp.onRoleChange(member, 'TROUPE_ADMIN')

    expect(snack.open).toHaveBeenCalledWith(
      'La troupe doit conserver au moins un administrateur actif.',
      'OK',
      { duration: 5000 },
    )
    expect(cmp.members().find((m) => m.id === 'm2')!.baselineRole).toBe('MEMBER')
  })

  it('exports csv via api', async () => {
    const { fixture, api, snack } = await setup()
    const cmp = fixture.componentInstance as MembresTab & { exportCsv(): Promise<void> }
    const createElement = vi.spyOn(document, 'createElement')

    await cmp.exportCsv()

    expect(api.exportMembersCsv).toHaveBeenCalledWith('t1')
    expect(createElement).toHaveBeenCalledWith('a')
    expect(snack.open).toHaveBeenCalledWith('Export téléchargé', 'OK', { duration: 3000 })
    createElement.mockRestore()
  })

  it('opens import results and refreshes after successful member import', async () => {
    const { fixture, api } = await setup()
    const cmp = fixture.componentInstance as MembresTab & {
      onImportMembersFileSelected(event: Event): Promise<void>
    }
    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: [new File(['email\nnew@example.com'], 'members.csv', { type: 'text/csv' })],
    })

    await cmp.onImportMembersFileSelected({ target: input } as unknown as Event)

    expect(api.importMembersCsv).toHaveBeenCalledWith('t1', expect.any(File))
    expect(api.listMembers).toHaveBeenCalledTimes(2)
  })

  it('runs user csv import through the results dialog', async () => {
    const { fixture, api } = await setup()
    const cmp = fixture.componentInstance as MembresTab & {
      onImportUsersFileSelected(event: Event): Promise<void>
    }
    const input = document.createElement('input')
    Object.defineProperty(input, 'files', {
      value: [new File(['email\nuser@example.com'], 'users.csv', { type: 'text/csv' })],
    })

    await cmp.onImportUsersFileSelected({ target: input } as unknown as Event)

    expect(api.importUsersCsv).toHaveBeenCalledWith('t1', expect.any(File))
  })

  it('opens a removal confirmation that distinguishes troupe removal from account deletion', async () => {
    const { fixture, api, dialog } = await setup()
    const cmp = fixture.componentInstance as MembresTab & {
      members: () => Array<{ id: string }>
      retirerMembre(member: unknown): void
    }
    const member = cmp.members().find((m) => m.id === 'm2')!

    cmp.retirerMembre(member)

    expect(dialog.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Retirer ce membre de la troupe ?',
          message: expect.stringContaining("Son compte HatCast n'est pas supprimé."),
          confirmLabel: 'Retirer',
        }),
      }),
    )
    expect(api.deactivateMember).not.toHaveBeenCalled()
  })

  it('soft-deactivates a member after confirmed removal', async () => {
    const { fixture, api, snack } = await setup({ confirmRemoval: true })
    const cmp = fixture.componentInstance as MembresTab & {
      members: () => Array<{ id: string }>
      retirerMembre(member: unknown): void
    }
    const member = cmp.members().find((m) => m.id === 'm2')!

    cmp.retirerMembre(member)
    await fixture.whenStable()

    expect(api.deactivateMember).toHaveBeenCalledWith('t1', 'm2')
    expect(snack.open).toHaveBeenCalledWith('Membre retiré de la troupe.', 'OK', {
      duration: 4000,
    })
    expect(api.listMembers).toHaveBeenCalledTimes(2)
  })

  it('shows the last-admin message when removal is rejected by the API', async () => {
    const { fixture, api, snack } = await setup({
      confirmRemoval: true,
      deactivateResult: { ok: false, status: 409 },
    })
    const cmp = fixture.componentInstance as MembresTab & {
      members: () => Array<{ id: string }>
      retirerMembre(member: unknown): void
    }
    const member = cmp.members().find((m) => m.id === 'm2')!

    cmp.retirerMembre(member)
    await fixture.whenStable()

    expect(api.deactivateMember).toHaveBeenCalledWith('t1', 'm2')
    expect(snack.open).toHaveBeenCalledWith(
      'La troupe doit conserver au moins un administrateur actif.',
      'OK',
      { duration: 5000 },
    )
  })
})

function text(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? ''
}
