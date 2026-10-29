import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdventTest } from './advent-test'

describe('AdventTest', () => {
  let fixture: ComponentFixture<AdventTest>
  beforeEach(async () => {
    vi.spyOn(window, 'fetch').mockImplementation(async input => {
      const day = Number(String(input).split('/').pop())
      return new Response(JSON.stringify({ day, name: day === 12 ? 'Camille' : 'Lutin', portrait: 'data:image/png;base64,aGVsbG8=', statements: ['un', 'deux', 'trois'] }), { status: 200 })
    })
    await TestBed.configureTestingModule({ imports: [AdventTest], providers: [provideRouter([])] }).compileComponents()
    fixture = TestBed.createComponent(AdventTest)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  })
  afterEach(() => vi.restoreAllMocks())
  it('opens the selected gift and focuses the fictional quiz', async () => {
    await fixture.componentInstance.selectDay(12)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__date').textContent.trim()).toBe('12 décembre')
    expect(fixture.nativeElement.querySelector('.advent__gift').getAttribute('aria-label')).toBe('Ouvrir le cadeau du jour 12')
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(fixture.nativeElement.textContent).toContain('Camille')
    expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(3)
    expect(document.activeElement?.id).toBe('quiz-title')
  })
  it('advances the test day and returns to the beginning', async () => {
    fixture.componentInstance.nextDay()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(fixture.componentInstance.selectedDay()).toBe(2)
    expect(fixture.nativeElement.querySelector('.advent__date').textContent.trim()).toBe('2 décembre')
    fixture.componentInstance.previousDay()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(fixture.componentInstance.selectedDay()).toBe(1)
    await fixture.componentInstance.selectDay(12)
    fixture.componentInstance.resetDay()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(fixture.componentInstance.selectedDay()).toBe(1)
    expect(fixture.nativeElement.querySelector('.advent__date').textContent.trim()).toBe('1 décembre')
  })
  it('locks selection while the selected preview loads', async () => {
    let resolveFetch!: (response: Response) => void
    vi.mocked(window.fetch).mockReturnValueOnce(new Promise(resolve => { resolveFetch = resolve }))
    const request = fixture.componentInstance.selectDay(10)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__test-actions button').disabled).toBe(true)
    resolveFetch(new Response('', { status: 503 }))
    await request
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Réessayer')
  })
})
