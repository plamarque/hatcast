import { ComponentFixture, TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdventTest } from './advent-test'

describe('AdventTest', () => {
  let fixture: ComponentFixture<AdventTest>
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdventTest] }).compileComponents()
    fixture = TestBed.createComponent(AdventTest)
    fixture.detectChanges()
  })
  afterEach(() => vi.restoreAllMocks())
  it('opens the fictional quiz with no answer controls and focuses its heading', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify({ day: 1, name: 'Camille Flocon', portrait: 'data:image/png;base64,aGVsbG8=', statements: ['un', 'deux', 'trois'] }), { status: 200 }))
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(fixture.nativeElement.textContent).toContain('Camille Flocon')
    expect(fixture.nativeElement.querySelectorAll('li')).toHaveLength(3)
    expect(fixture.nativeElement.querySelector('.advent__opening')?.getAttribute('aria-hidden')).toBe('true')
    expect(fixture.nativeElement.querySelector('button')).toBeNull()
    expect(document.activeElement?.id).toBe('quiz-title')
  })
  it('selects a future door with reduced motion and opens it immediately', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify({ day: 12, name: 'Sacha Givre', portrait: 'data:image/png;base64,aGVsbG8=', statements: ['un', 'deux', 'trois'] }), { status: 200 }))
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    buttons[1].focus()
    buttons[1].click()
    fixture.detectChanges()
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true')
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fetchSpy).toHaveBeenCalledWith('/v1/advent-test/doors/12', expect.anything())
    expect(fixture.nativeElement.textContent).toContain('Sacha Givre')
    expect(fixture.componentInstance.quiz()?.day).toBe(12)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement?.id).toBe('quiz-title')
    vi.unstubAllGlobals()
  })
  it('locks door selection until the request finishes', async () => {
    let resolveFetch!: (response: Response) => void
    const fetchSpy = vi.spyOn(window, 'fetch').mockReturnValue(new Promise(resolve => { resolveFetch = resolve }))
    const request = fixture.componentInstance.openDoor()
    fixture.detectChanges()
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    expect(buttons[0].disabled).toBe(true)
    expect(buttons[1].disabled).toBe(true)
    buttons[1].click()
    expect(fixture.componentInstance.selectedDay()).toBe(1)
    expect(fetchSpy).toHaveBeenCalledWith('/v1/advent-test/doors/1', expect.anything())
    resolveFetch(new Response('', { status: 503 }))
    await request
    fixture.detectChanges()
    expect(buttons[1].disabled).toBe(false)
  })
  it('shows an error and allows retry when the API fails', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('offline'))
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false)
  })
})
