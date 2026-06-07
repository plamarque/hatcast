import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { DrawChancesHelpDialog } from './draw-chances-help-dialog'

describe('DrawChancesHelpDialog', () => {
  let fixture: ComponentFixture<DrawChancesHelpDialog>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawChancesHelpDialog, NoopAnimationsModule],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: { isMobile: true } },
        { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(DrawChancesHelpDialog)
    fixture.detectChanges()
  })

  it('renders slide carousel with first step copy', () => {
    expect(fixture.nativeElement.textContent).toContain('dans un sac')
    expect(fixture.nativeElement.querySelector('.draw-chances-help__image')?.getAttribute('src')).toBe(
      '/img/slide-1.jpg',
    )
  })

  it('advances to last slide with multi-draw copy', () => {
    const comp = fixture.componentInstance as unknown as { nextSlide: () => void }
    for (let step = 0; step < 4; step++) {
      comp.nextSlide()
      fixture.detectChanges()
    }
    expect(fixture.nativeElement.textContent).toContain('sans remettre')
    expect(fixture.nativeElement.textContent).not.toContain('Dans l’app')
  })
})
