import { TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import type { TroupeMemberAdmin } from '../../core/troupes/troupe-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { EditTroupeMemberDialog } from './edit-troupe-member-dialog'

function member(overrides: Partial<TroupeMemberAdmin> = {}): TroupeMemberAdmin {
  return {
    id: 'm1',
    userId: 'u1',
    userSlug: 'member',
    email: 'member@example.com',
    displayName: 'Membre',
    status: 'ACTIVE',
    baselineRole: 'MEMBER',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('EditTroupeMemberDialog', () => {
  it('requires a non-empty display name', async () => {
    const api = { updateMember: vi.fn() }
    const ref = { close: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [EditTroupeMemberDialog, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: { troupeId: 't1', member: member() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EditTroupeMemberDialog)
    const cmp = fixture.componentInstance as EditTroupeMemberDialog & {
      displayName: { set(v: string): void }
      submit(): Promise<void>
      error: () => string
    }
    cmp.displayName.set('   ')
    await cmp.submit()

    expect(cmp.error()).toBe('Saisissez un nom.')
    expect(api.updateMember).not.toHaveBeenCalled()
  })

  it('closes without PATCH when display name is unchanged for a member', async () => {
    const api = { updateMember: vi.fn() }
    const ref = { close: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [EditTroupeMemberDialog, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: { troupeId: 't1', member: member() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EditTroupeMemberDialog)
    await fixture.componentInstance.submit()

    expect(api.updateMember).not.toHaveBeenCalled()
    expect(ref.close).toHaveBeenCalledWith(false)
  })

  it('patches displayName only for linked members (no email in body)', async () => {
    const api = { updateMember: vi.fn().mockResolvedValue({ ok: true, status: 200, data: {} }) }
    const ref = { close: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [EditTroupeMemberDialog, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialogRef, useValue: ref },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { troupeId: 't1', member: member({ displayName: 'Ancien nom' }) },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EditTroupeMemberDialog)
    const cmp = fixture.componentInstance as EditTroupeMemberDialog & {
      displayName: { set(v: string): void }
      submit(): Promise<void>
    }
    cmp.displayName.set('Nouveau nom')
    await cmp.submit()

    expect(api.updateMember).toHaveBeenCalledWith('t1', 'm1', { displayName: 'Nouveau nom' })
    expect(ref.close).toHaveBeenCalledWith(true)
  })

  it('patches externe with displayName and email', async () => {
    const api = { updateMember: vi.fn().mockResolvedValue({ ok: true, status: 200, data: {} }) }
    const ref = { close: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [EditTroupeMemberDialog, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialogRef, useValue: ref },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            troupeId: 't1',
            member: member({
              id: 'mx',
              userId: null,
              email: null,
              displayName: 'DJ local',
              baselineRole: 'EXTERNE',
            }),
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EditTroupeMemberDialog)
    const cmp = fixture.componentInstance as EditTroupeMemberDialog & {
      displayName: { set(v: string): void }
      email: { set(v: string): void }
      submit(): Promise<void>
    }
    cmp.displayName.set('DJ renommé')
    cmp.email.set('dj@example.com')
    await cmp.submit()

    expect(api.updateMember).toHaveBeenCalledWith('t1', 'mx', {
      displayName: 'DJ renommé',
      email: 'dj@example.com',
    })
    expect(ref.close).toHaveBeenCalledWith(true)
  })

  it('shows 409 conflict inline', async () => {
    const api = { updateMember: vi.fn().mockResolvedValue({ ok: false, status: 409 }) }
    const ref = { close: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [EditTroupeMemberDialog, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: { troupeId: 't1', member: member() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EditTroupeMemberDialog)
    const cmp = fixture.componentInstance as EditTroupeMemberDialog & {
      displayName: { set(v: string): void }
      submit(): Promise<void>
      error: () => string
    }
    cmp.displayName.set('Autre nom')
    await cmp.submit()

    expect(cmp.error()).toBe('La troupe doit conserver au moins un administrateur actif.')
    expect(ref.close).not.toHaveBeenCalled()
  })

  it('shows 400 email error inline for externe', async () => {
    const api = { updateMember: vi.fn().mockResolvedValue({ ok: false, status: 400 }) }
    const ref = { close: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [EditTroupeMemberDialog, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialogRef, useValue: ref },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            troupeId: 't1',
            member: member({
              id: 'mx',
              userId: null,
              email: null,
              displayName: 'DJ',
              baselineRole: 'EXTERNE',
            }),
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EditTroupeMemberDialog)
    const cmp = fixture.componentInstance as EditTroupeMemberDialog & {
      email: { set(v: string): void }
      submit(): Promise<void>
      error: () => string
    }
    cmp.email.set('bad-email')
    await cmp.submit()

    expect(cmp.error()).toBe('Email invalide.')
    expect(ref.close).not.toHaveBeenCalled()
  })
})
