import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeMembersDialog } from './troupe-members-dialog'

describe('TroupeMembersDialog', () => {
  async function setup() {
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
          ],
          page: 0,
          size: 100,
          totalElements: 1,
          totalPages: 1,
        },
      }),
      addMember: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { id: 'm2' } }),
      updateMember: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { id: 'm1' } }),
      deactivateMember: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
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
    }
    const dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }),
    }
    await TestBed.configureTestingModule({
      imports: [TroupeMembersDialog, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { troupeId: 't1' } },
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents()
    const fixture = TestBed.createComponent(TroupeMembersDialog)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return { fixture, api, dialog }
  }

  it('loads troupe members on init', async () => {
    const { fixture, api } = await setup()

    expect(api.listMembers).toHaveBeenCalledWith('t1', 0, 100)
    expect(text(fixture)).toContain('admin@example.com')
    expect(text(fixture)).toContain('Exporter CSV')
    expect(text(fixture)).toContain('Importer utilisateurs CSV')
    expect(text(fixture)).toContain('Importer membres CSV')
  })

  it('adds a member and refreshes the list', async () => {
    const { fixture, api } = await setup()
    const cmp = fixture.componentInstance as TroupeMembersDialog & {
      addEmail: string
      addDisplayName: string
      addMember(): Promise<void>
    }
    cmp.addEmail = 'new@example.com'
    cmp.addDisplayName = 'Nouveau'

    await cmp.addMember()

    expect(api.addMember).toHaveBeenCalledWith('t1', {
      email: 'new@example.com',
      displayName: 'Nouveau',
      baselineRole: 'MEMBER',
    })
    expect(api.listMembers).toHaveBeenCalledTimes(2)
  })

  it('shows last-admin copy on conflict', async () => {
    const { fixture, api } = await setup()
    api.updateMember.mockResolvedValueOnce({ ok: false, status: 409 })
    const cmp = fixture.componentInstance as TroupeMembersDialog & {
      members: () => Array<{ id: string }>
      saveMember(member: unknown): Promise<void>
    }

    await cmp.saveMember(cmp.members()[0])
    fixture.detectChanges()

    expect(text(fixture)).toContain('La troupe doit conserver au moins un administrateur actif.')
  })
})

function text(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? ''
}
