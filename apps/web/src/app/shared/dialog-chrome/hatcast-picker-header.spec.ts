import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { HatcastPickerHeader } from './hatcast-picker-header'

describe('HatcastPickerHeader', () => {
  async function setup(surface: 'sheet' | 'dialog') {
    await TestBed.configureTestingModule({
      imports: [HatcastPickerHeader, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(HatcastPickerHeader)
    fixture.componentRef.setInput('title', 'Filtrer')
    fixture.componentRef.setInput('surface', surface)
    fixture.detectChanges()
    return { fixture }
  }

  it('shows drag handle and close on sheet surface', async () => {
    const { fixture } = await setup('sheet')
    expect(fixture.nativeElement.querySelector('.filter-picker-shell__drag-handle')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('button[mat-icon-button]')).toBeTruthy()
  })

  it('hides drag handle and close on dialog surface', async () => {
    const { fixture } = await setup('dialog')
    expect(fixture.nativeElement.querySelector('.filter-picker-shell__drag-handle')).toBeNull()
    expect(fixture.nativeElement.querySelector('button[mat-icon-button]')).toBeNull()
  })

  it('emits close when sheet close pressed', async () => {
    const { fixture } = await setup('sheet')
    const close = vi.fn()
    fixture.componentInstance.close.subscribe(close)
    const btn = fixture.nativeElement.querySelector('button[mat-icon-button]') as HTMLButtonElement
    btn.click()
    expect(close).toHaveBeenCalled()
  })
})
