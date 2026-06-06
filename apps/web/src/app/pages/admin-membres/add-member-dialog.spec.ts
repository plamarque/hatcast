import { TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { AddMemberDialog } from './add-member-dialog'

describe('AddMemberDialog', () => {
  it('requires display name for externe but not email', async () => {
    const api = {
      addExterne: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { id: 'x' } }),
      addMember: vi.fn(),
    }
    const ref = { close: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [AddMemberDialog, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: api },
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: { troupeId: 't1' } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AddMemberDialog)
    const cmp = fixture.componentInstance as AddMemberDialog & {
      baselineRole: { set(v: string): void }
      displayName: { set(v: string): void }
      email: { set(v: string): void }
      submit(): Promise<void>
      error: () => string
    }
    cmp.baselineRole.set('EXTERNE')
    fixture.detectChanges()

    await cmp.submit()
    expect(cmp.error()).toContain('nom affiché')
    expect(api.addExterne).not.toHaveBeenCalled()

    cmp.displayName.set('DJ local')
    await cmp.submit()
    expect(api.addExterne).toHaveBeenCalledWith('t1', { displayName: 'DJ local', email: undefined })
    expect(ref.close).toHaveBeenCalledWith(true)
  })
})
