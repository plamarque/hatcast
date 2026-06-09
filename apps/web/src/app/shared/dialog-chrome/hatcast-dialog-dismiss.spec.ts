import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { HatcastDialogDismiss } from './hatcast-dialog-dismiss'

describe('HatcastDialogDismiss', () => {
  async function setup(label: 'annuler' | 'fermer' | 'plus_tard' = 'fermer') {
    await TestBed.configureTestingModule({
      imports: [HatcastDialogDismiss, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(HatcastDialogDismiss)
    fixture.componentRef.setInput('label', label)
    fixture.detectChanges()
    return { fixture }
  }

  it('renders Annuler copy for annuler key', async () => {
    const { fixture } = await setup('annuler')
    expect(fixture.nativeElement.textContent).toContain('Annuler')
  })

  it('emits clicked on press', async () => {
    const { fixture } = await setup('fermer')
    const clicked = vi.fn()
    fixture.componentInstance.clicked.subscribe(clicked)
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement
    btn.click()
    expect(clicked).toHaveBeenCalled()
  })

  it('uses mat-button not flat', async () => {
    const { fixture } = await setup('fermer')
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement
    expect(btn.classList.contains('mat-mdc-unelevated-button')).toBe(false)
  })
})
