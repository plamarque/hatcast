import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { SeasonOrganizersDialog } from './season-organizers-dialog'

describe('SeasonOrganizersDialog', () => {
  async function setup() {
    const api = {
      listSeasonOrganizers: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: [{ userId: 'u1', email: 'orga@example.com', displayName: 'Orga', grantedAt: '' }],
      }),
      addSeasonOrganizer: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { userId: 'u2', email: 'new@example.com', displayName: null, grantedAt: '' },
      }),
      removeSeasonOrganizer: vi.fn().mockResolvedValue({ ok: true, status: 204 }),
    }
    await TestBed.configureTestingModule({
      imports: [SeasonOrganizersDialog, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { seasonId: 's1' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: OrganizerApiService, useValue: api },
      ],
    }).compileComponents()
    const fixture = TestBed.createComponent(SeasonOrganizersDialog)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return { fixture, api }
  }

  it('loads season organizers on init', async () => {
    const { fixture, api } = await setup()

    expect(api.listSeasonOrganizers).toHaveBeenCalledWith('s1')
    expect(text(fixture)).toContain('orga@example.com')
  })

  it('adds organizer and refreshes the list', async () => {
    const { fixture, api } = await setup()
    const cmp = fixture.componentInstance as SeasonOrganizersDialog & {
      organizerEmail: string
      addOrganizer(): Promise<void>
    }
    cmp.organizerEmail = 'new@example.com'

    await cmp.addOrganizer()

    expect(api.addSeasonOrganizer).toHaveBeenCalledWith('s1', 'new@example.com')
    expect(api.listSeasonOrganizers).toHaveBeenCalledTimes(2)
  })
})

function text(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? ''
}
