import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { OrganisateursTab } from './organisateurs-tab'

describe('OrganisateursTab', () => {
  async function setup() {
    const api = {
      listSeasonOrganizers: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: [{ userId: 'u1', email: 'orga@example.com', displayName: 'Orga', grantedAt: '' }],
      }),
      addSeasonOrganizer: vi.fn(),
      removeSeasonOrganizer: vi.fn().mockResolvedValue({ ok: true, status: 204 }),
    }
    const dialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) }

    await TestBed.configureTestingModule({
      imports: [OrganisateursTab, NoopAnimationsModule],
      providers: [
        { provide: OrganizerApiService, useValue: api },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(OrganisateursTab)
    fixture.componentRef.setInput('seasonId', 's1')
    fixture.componentRef.setInput('troupeId', 't1')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return { fixture, api, dialog }
  }

  it('loads organizers and hides csv controls', async () => {
    const { fixture, api } = await setup()

    expect(api.listSeasonOrganizers).toHaveBeenCalledWith('s1')
    expect(text(fixture)).toContain('orga@example.com')
    expect(text(fixture)).not.toContain('Exporter')
    expect(text(fixture)).not.toContain('Importer')
  })

  it('opens add organizer dialog', async () => {
    const { fixture, dialog } = await setup()
    const cmp = fixture.componentInstance as OrganisateursTab & { openAddOrganizer(): void }

    cmp.openAddOrganizer()

    expect(dialog.open).toHaveBeenCalled()
  })

  it('removes organizer after confirmation', async () => {
    const { fixture, api, dialog } = await setup()
    const cmp = fixture.componentInstance as OrganisateursTab & {
      confirmRemove(organizer: unknown): void
      organizers: () => Array<{ userId: string }>
    }

    cmp.confirmRemove(cmp.organizers()[0])

    expect(dialog.open).toHaveBeenCalled()
    await fixture.whenStable()
    expect(api.removeSeasonOrganizer).toHaveBeenCalledWith('s1', 'u1')
  })
})

function text(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? ''
}
