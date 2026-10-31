import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdventTest } from './advent-test'

describe('AdventTest', () => {
  let fixture: ComponentFixture<AdventTest>
  beforeEach(async () => {
    vi.spyOn(window, 'fetch').mockImplementation(async input => {
      if (String(input).endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'test-session', testControls: true }), { status: 200 })
      if (String(input).endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-01' }))
      if (String(input).endsWith('/results/latest-unseen')) return new Response(JSON.stringify({ result: null }))
      if (String(input).endsWith('/result')) return new Response('', { status: 404 })
      if (String(input).includes('/answer')) return new Response(JSON.stringify({ status: 'available', generation: 'test-generation' }), { status: 200 })
      const day = Number(String(input).split('/').pop())
      return new Response(JSON.stringify({ day, name: day === 12 ? 'Camille' : 'Lutin', portrait: 'data:image/png;base64,aGVsbG8=', statements: ['un', 'deux', 'trois'] }), { status: 200 })
    })
    await TestBed.configureTestingModule({ imports: [AdventTest], providers: [provideRouter([])] }).compileComponents()
    fixture = TestBed.createComponent(AdventTest)
    fixture.detectChanges()
    await fixture.whenStable()
    await new Promise(resolve => setTimeout(resolve, 0))
    fixture.detectChanges()
  })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })
  it('follows the server clock until the operator explicitly selects a simulation', async () => {
    const calls = vi.mocked(window.fetch).mock.calls
    expect(calls.some(([, options]) => (options?.headers as Record<string, string>)?.['X-Advent-Simulated-Date'])).toBe(false)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ date: '2026-12-02' })))
    await fixture.componentInstance.continueAfterResult()
    expect(fixture.componentInstance.clockDate()).toBe('2026-12-02')
    expect(vi.mocked(window.fetch).mock.calls.some(([, options]) => (options?.headers as Record<string, string>)?.['X-Advent-Simulated-Date'])).toBe(false)
    await fixture.componentInstance.nextDay()
    expect(fixture.componentInstance.clockDate()).toBe('2026-12-03')
    expect(vi.mocked(window.fetch).mock.calls.some(([url, options]) => String(url).endsWith('/latest-unseen') && (options?.headers as Record<string, string>)?.['X-Advent-Simulated-Date'] === '2026-12-03')).toBe(true)
  })
  it.each(['priority', 'quiz'])('clears stale content and retries the selected date after %s fails', async failure => {
    expect(fixture.componentInstance.preview()?.day).toBe(1)
    if (failure === 'quiz') vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('network'))
    await fixture.componentInstance.nextDay()
    fixture.detectChanges()
    expect(fixture.componentInstance.clockDate()).toBe('2026-12-02')
    expect(fixture.componentInstance.preview()).toBeNull()
    expect(fixture.componentInstance.quiz()).toBeNull()
    expect(fixture.componentInstance.result()).toBeNull()
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull()
    await fixture.componentInstance.retryEntry()
    fixture.detectChanges()
    expect(fixture.componentInstance.error()).toBe(false)
    expect(fixture.componentInstance.preview()?.day).toBe(2)
    const request = vi.mocked(window.fetch).mock.calls.filter(([url]) => String(url).endsWith('/latest-unseen')).at(-1)
    expect((request?.[1]?.headers as Record<string, string>)['X-Advent-Simulated-Date']).toBe('2026-12-02')
  })
  it('does not retain an old revealed result when a date change fails', async () => {
    fixture.componentInstance.result.set({ answerId: 'old', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: true })
    fixture.componentInstance.resultContent.set({ day: 1, name: 'Ancien', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] })
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('network'))
    await fixture.componentInstance.nextDay()
    fixture.detectChanges()
    expect(fixture.componentInstance.result()).toBeNull()
    expect(fixture.componentInstance.resultContent()).toBeNull()
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Bravo, tu as trouvé')
  })
  it('does not offer final ranking when the priority lookup fails on Christmas', async () => {
    fixture.componentInstance.clockDate.set('2026-12-24')
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('network'))
    await fixture.componentInstance.nextDay()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Voir le classement')
  })
  it('asks for confirmation before resetting the shared development game', async () => {
    const trigger = fixture.nativeElement.querySelector('[aria-label="Réinitialiser la partie de développement"]') as HTMLButtonElement
    expect(trigger).not.toBeNull()
    trigger.click()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Toutes les réponses de cette partie seront effacées')
    expect(vi.mocked(window.fetch).mock.calls.some(call => String(call[0]).endsWith('/session/reset'))).toBe(false)
    const cancel = [...fixture.nativeElement.querySelectorAll('button')].find((button: any) => button.textContent.includes('Annuler')) as HTMLButtonElement
    cancel.click()
    fixture.detectChanges()
    expect(fixture.componentInstance.resetConfirm()).toBe(false)
  })
  it('allows advancing through January 15 and stops at the access boundary', async () => {
    fixture.componentInstance.clockDate.set('2026-12-25')
    fixture.detectChanges()
    const next = fixture.nativeElement.querySelector('[aria-label="Avancer au jour suivant"]') as HTMLButtonElement
    expect(next.disabled).toBe(false)
    fixture.componentInstance.clockDate.set('2027-01-14')
    fixture.detectChanges()
    expect(next.disabled).toBe(false)
    fixture.componentInstance.clockDate.set('2027-01-15')
    fixture.detectChanges()
    expect(next.disabled).toBe(true)
  })
  it('offers ranking only after an answer has been recorded', async () => {
    expect(fixture.nativeElement.textContent).not.toContain('Voir le classement')
    await fixture.componentInstance.openRanking()
    expect(fixture.componentInstance.rankingOpen()).toBe(false)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Voir le classement')
  })
  it('shows the current test ranking and returns keyboard focus', async () => {
    fixture.componentInstance.quiz.set(fixture.componentInstance.preview())
    fixture.componentInstance.answerState.set('recorded')
    fixture.detectChanges()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ priorityResult: null, ranking: { score: 11, rank: 2, entries: [
      { name: 'Alex', score: 12, rank: 1, mine: false }, { name: 'Camille', score: 11, rank: 2, mine: true },
    ] } })))
    await fixture.componentInstance.openRanking()
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement?.id).toBe('ranking-title')
    expect(fixture.nativeElement.textContent).toContain('tous les points enregistrés')
    expect(fixture.nativeElement.textContent).toContain('Rang 2 · Camille')
    expect(fixture.nativeElement.textContent).toContain('Bonne réponse')
    fixture.componentInstance.closeRanking(true)
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement?.textContent).toContain('Voir le classement')
  })
  it('shows a newly eligible priority reveal before the ranking', async () => {
    fixture.componentInstance.quiz.set(fixture.componentInstance.preview())
    fixture.componentInstance.answerState.set('recorded')
    const result = { answerId: 'new', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ priorityResult: result, ranking: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ day: 1, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    await fixture.componentInstance.openRanking()
    fixture.detectChanges()
    expect(fixture.componentInstance.rankingOpen()).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('Bravo, tu as trouvé')
  })
  it('shows ranking errors and fences a reset session', async () => {
    fixture.componentInstance.quiz.set(fixture.componentInstance.preview())
    fixture.componentInstance.answerState.set('recorded')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response('', { status: 409 }))
    await fixture.componentInstance.openRanking()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('réinitialisée')
    expect(fixture.nativeElement.querySelector('#ranking-title')).toBeNull()
  })
  it('blocks ranking while a priority result is displayed', async () => {
    fixture.componentInstance.result.set({ answerId: 'test', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false })
    vi.mocked(window.fetch).mockClear()
    await fixture.componentInstance.openRanking()
    expect(window.fetch).not.toHaveBeenCalled()
    expect(fixture.componentInstance.rankingOpen()).toBe(false)
  })
  it('reports a missing quiz without suggesting reconnection', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response('', { status: 404 }))
    await fixture.componentInstance.selectDay(2)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__state[role=status]').textContent).toContain('quiz est indisponible')
    expect(fixture.nativeElement.textContent).not.toContain('déconnecte-toi')
  })
  it('reports removal while reconciling or reserving', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'unavailable' })))
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('quiz est indisponible')
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()
  })
  it('reports removal during reservation and confirmation', async () => {
    const component = fixture.componentInstance
    await component.openDoor()
    component.choice.set(0)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'unavailable' })))
    await component.confirm()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('quiz est indisponible')
    await component.selectDay(1)
    await component.openDoor()
    component.choice.set(0)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'unavailable' })))
    await component.confirm()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('quiz est indisponible')
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()
  })

  it('allows recovery when an unseen result has lost its content', async () => {
    fixture.componentInstance.selectedDay.set(2)
    const result = { answerId: 'old', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockImplementation(async input => {
      if (String(input).endsWith('/session')) return new Response(JSON.stringify({ sessionId: 's', testControls: true }))
      if (String(input).endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-02' }))
      if (String(input).endsWith('/latest-unseen')) return new Response(JSON.stringify({ result }))
      return new Response('', { status: 404 })
    })
    await fixture.componentInstance.start()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('quiz est indisponible')
    expect(fixture.componentInstance.selectedDay()).toBe(1)
    await fixture.componentInstance.selectDay(fixture.componentInstance.selectedDay())
    expect(String(vi.mocked(window.fetch).mock.calls.at(-1)?.[0])).toBe('/v1/advent/doors/1')
    expect(fixture.nativeElement.querySelector('[aria-label="Avancer au jour suivant"]')).toBeTruthy()
  })
  it('explains that the operator must reset legacy test answers', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: 's', transitionRequired: true })))
    await fixture.componentInstance.start()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('réinitialisées par l’opérateur')
  })

  it('keeps the recorded confirmation neutral and uses the authorized portrait', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    const status = fixture.nativeElement.querySelector('.advent__recorded') as HTMLElement
    expect(status.textContent).toContain('Ta réponse est enregistrée')
    expect(status.textContent).not.toMatch(/bonne réponse|mauvaise réponse|points|un|deux|trois/i)
    expect(fixture.nativeElement.querySelector('.advent__portrait img').getAttribute('src')).toBe('data:image/png;base64,aGVsbG8=')
    const illustration = fixture.nativeElement.querySelector('.advent__portrait img') as HTMLImageElement
    expect(illustration.getAttribute('src')).toBe('data:image/png;base64,aGVsbG8=')
    expect(illustration.getAttribute('alt')).toContain('Portrait du lutin')
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()
  })
  it('returns directly to the acknowledgement for a previously answered day', async () => {
    vi.mocked(window.fetch).mockImplementation(async input => {
      const url = String(input)
      if (url.endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'test-session', testControls: true }))
      if (url.endsWith('/result')) return new Response('', { status: 404 })
      if (url.endsWith('/1/answer')) return new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: 'available' }))
      const day = Number(url.split('/').pop())
      return new Response(JSON.stringify({ day, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] }))
    })
    await fixture.componentInstance.selectDay(2)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__gift')).toBeTruthy()
    await fixture.componentInstance.selectDay(1)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__gift')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Ta réponse est enregistrée')
    expect(fixture.nativeElement.querySelector('[aria-label="Effacer ma réponse et rejouer"]')).toBeTruthy()
  })

  it('announces loading and a closed quiz through request transitions', async () => {
    let resolvePreview!: (response: Response) => void
    vi.mocked(window.fetch).mockReturnValueOnce(new Promise(resolve => { resolvePreview = resolve }))
    const selection = fixture.componentInstance.selectDay(2)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__state[role=status]').textContent).toContain('Le lutin arrive')
    resolvePreview(new Response(JSON.stringify({ day: 2, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
    await selection

    let resolveReconciliation!: (response: Response) => void
    vi.mocked(window.fetch).mockReturnValueOnce(new Promise(resolve => { resolveReconciliation = resolve }))
    const opening = fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__state[role=status]').textContent).toContain('Vérification en cours')
    resolveReconciliation(new Response(JSON.stringify({ status: 'closed' })))
    await opening
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__state[role=status]').textContent).toContain('Ce quiz est fermé')
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()
  })

  it('opens the selected gift and focuses the fictional quiz', async () => {
    await fixture.componentInstance.selectDay(12)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__date').textContent.trim()).toBe('12 décembre')
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Camille a un défi pour toi')
    expect(fixture.nativeElement.querySelector('h1 .advent__name').textContent).toBe('Camille')
    expect(fixture.nativeElement.querySelector('.advent__gift').getAttribute('aria-label')).toBe('Ouvrir le cadeau du jour 12')
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(fixture.nativeElement.textContent).toContain('Camille')
    expect(fixture.nativeElement.querySelectorAll('mat-radio-button')).toHaveLength(3)
    expect(document.activeElement?.id).toBe('quiz-title')
  })

  it('requires a selection and reconciles an uncertain submission', async () => {
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    const component = fixture.componentInstance
    expect(component.answerState()).toBe('available')
    expect(fixture.nativeElement.querySelector('button[mat-flat-button]').disabled).toBe(true)
    component.choice.set(1)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available', generation: 'test-generation' }), { status: 200 }))
      .mockRejectedValueOnce(new Error('lost response'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' }), { status: 200 }))
    await component.confirm()
    fixture.detectChanges()
    expect(component.answerState()).toBe('recorded')
    expect(fixture.nativeElement.textContent).toContain('Ta réponse est enregistrée')
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()
  })
  it('reconciles again when a new instance opens after a lost response', async () => {
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.choice.set(1)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available', generation: 'test-generation' }), { status: 200 }))
      .mockRejectedValueOnce(new Error('lost response'))
      .mockRejectedValueOnce(new Error('offline'))
    await fixture.componentInstance.confirm()
    expect(fixture.componentInstance.answerState()).toBe('uncertain')
    const replacement = TestBed.createComponent(AdventTest)
    replacement.detectChanges()
    await replacement.whenStable()
    await new Promise(resolve => setTimeout(resolve, 0))
    await replacement.componentInstance.openDoor()
    expect(replacement.componentInstance.answerState()).toBe('available')
    expect(vi.mocked(window.fetch).mock.calls.at(-1)?.[0]).toBe('/v1/advent/doors/1/answer/reconcile')
    replacement.destroy()
  })
  it('sends the selected option to the selected quiz', async () => {
    await fixture.componentInstance.selectDay(12)
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.choice.set(2)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available', generation: 'test-generation' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' }), { status: 200 }))
    await fixture.componentInstance.confirm()
    const [url, options] = vi.mocked(window.fetch).mock.calls.at(-1)!
    expect(url).toBe('/v1/advent/doors/12/answer')
    expect(options?.method).toBe('POST')
    expect(JSON.parse(String(options?.body))).toEqual({ choice: 2, attemptId: expect.any(String) })
  })
  it('recovers from a stalled reconciliation without enabling retry', async () => {
    vi.useFakeTimers()
    vi.mocked(window.fetch).mockReturnValueOnce(new Promise(() => {}))
    const opening = fixture.componentInstance.openDoor()
    await vi.advanceTimersByTimeAsync(10_000)
    await opening
    expect(fixture.componentInstance.answerState()).toBe('uncertain')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ date: '2026-12-02' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    await fixture.componentInstance.nextDay()
    expect(fixture.componentInstance.selectedDay()).toBe(2)
  })
  it('reconciles a timed-out answer before allowing another confirmation', async () => {
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.choice.set(1)
    vi.useFakeTimers()
    vi.mocked(window.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' }), { status: 200 }))
      .mockReturnValueOnce(new Promise(() => {}))
      .mockReturnValueOnce(new Promise(() => {}))
    const confirmation = fixture.componentInstance.confirm()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fixture.componentInstance.submitting()).toBe(true)
    await vi.advanceTimersByTimeAsync(10_000)
    await confirmation
    expect(fixture.componentInstance.submitting()).toBe(false)
    expect(fixture.componentInstance.answerState()).toBe('uncertain')
    expect(vi.mocked(window.fetch).mock.calls.at(-1)?.[0]).toBe('/v1/advent/doors/1/answer/reconcile')
    const calls = vi.mocked(window.fetch).mock.calls.length
    await fixture.componentInstance.confirm()
    expect(vi.mocked(window.fetch).mock.calls.length).toBe(calls)
  })
  it('recovers when the preview never responds', async () => {
    vi.useFakeTimers()
    vi.mocked(window.fetch).mockReturnValueOnce(new Promise(() => {}))
    const selection = fixture.componentInstance.selectDay(10)
    await vi.advanceTimersByTimeAsync(10_000)
    await selection
    expect(fixture.componentInstance.loading()).toBe(false)
    expect(fixture.componentInstance.error()).toBe(true)
  })
  it('moves only the tab date by one day with each arrow', async () => {
    const component = fixture.componentInstance
    await component.nextDay()
    expect(component.clockDate()).toBe('2026-12-02')
    expect(component.selectedDay()).toBe(2)
    await component.previousDay()
    expect(component.clockDate()).toBe('2026-12-01')
    expect(component.selectedDay()).toBe(1)
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).includes('/clock/previous-day'))).toBe(false)
  })
  it('re-enters at the previous date and prioritizes its latest unseen reveal', async () => {
    const component = fixture.componentInstance
    const result = { answerId: 'a', day: 2, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    component.clockDate.set('2026-12-04')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ day: 2, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    await component.previousDay()
    expect(component.clockDate()).toBe('2026-12-03')
    expect(component.result()?.day).toBe(2)
    expect(component.preview()).toBeNull()
  })

  it('opens the previous date quiz when no unseen result is eligible', async () => {
    const component = fixture.componentInstance
    component.clockDate.set('2026-12-04')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    await component.previousDay()
    expect(component.clockDate()).toBe('2026-12-03')
    expect(component.result()).toBeNull()
    expect(component.preview()?.day).toBe(3)
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
  it('offers replay from a neutral acknowledgement and resets the choice', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' }), { status: 200 }))
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.choice.set(1)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain('Quelle affirmation est fausse')
    const button = fixture.nativeElement.querySelector('.advent__test-actions button[aria-label="Effacer ma réponse et rejouer"]') as HTMLButtonElement
    expect(button).toBeTruthy()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available', generation: 'new' }), { status: 200 }))
    button.click()
    await fixture.whenStable()
    expect(fixture.componentInstance.answerState()).toBe('available')
    expect(fixture.componentInstance.choice()).toBeNull()
  })
  it('replays the selected day and confirms a fresh choice through a stateful API', async () => {
    let recorded = true
    let token = 'token-before'
    const calls: Array<{ url: string; body: any }> = []
    vi.mocked(window.fetch).mockImplementation(async (input, options) => {
      const url = String(input)
      const body = options?.body ? JSON.parse(String(options.body)) : null
      calls.push({ url, body })
      if (url.endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'test-session', testControls: true }))
      if (url.endsWith('/result')) return new Response('', { status: 404 })
      if (!url.includes('/answer')) return new Response(JSON.stringify({ day: 12, name: 'Camille', portrait: '', statements: ['un', 'deux', 'trois'] }))
      if (url.endsWith('/replay')) {
        expect(body.replayToken).toBe(token)
        recorded = false
        return new Response(JSON.stringify({ status: 'available' }))
      }
      if (url.endsWith('/reconcile')) return new Response(JSON.stringify(recorded ? { status: 'recorded', replayToken: token } : { status: 'available', generation: 'new-generation' }))
      if (url.endsWith('/reserve')) return new Response(JSON.stringify({ status: 'available' }))
      if (url.endsWith('/answer') && options?.method !== 'POST') return new Response(JSON.stringify(recorded ? { status: 'recorded', replayToken: token } : { status: 'available' }))
      recorded = true
      token = 'token-after'
      return new Response(JSON.stringify({ status: 'recorded', replayToken: token }))
    })
    await fixture.componentInstance.selectDay(12)
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('section').getAttribute('aria-labelledby')).toBe('recorded-title')
    await fixture.componentInstance.replay()
    expect(fixture.componentInstance.choice()).toBeNull()
    fixture.componentInstance.choice.set(2)
    await fixture.componentInstance.confirm()
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.advent__recorded'))
    expect(calls.find(call => call.url.endsWith('/replay'))).toEqual({ url: '/v1/advent/doors/12/answer/replay', body: { replayToken: 'token-before' } })
    expect(calls.find(call => call.url.endsWith('/reserve'))?.body.generation).toBe('new-generation')
    expect(calls.at(-1)?.body.choice).toBe(2)
    expect(fixture.componentInstance.answerState()).toBe('recorded')
  })
  it('clears the choice when a replay response is lost', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.choice.set(1)
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('lost'))
    await fixture.componentInstance.replay()
    expect(fixture.componentInstance.choice()).toBeNull()
    expect(fixture.componentInstance.answerState()).toBe('uncertain')
  })
  it('does not display a recorded state without a replay token', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded' })))
    await fixture.componentInstance.openDoor()
    expect(fixture.componentInstance.answerState()).toBe('uncertain')
  })
  it('sends the session fence and leaves a stale session uncertain', async () => {
    await fixture.componentInstance.openDoor()
    const options = vi.mocked(window.fetch).mock.calls.at(-1)?.[1]
    expect(options?.headers).toMatchObject({ 'X-Advent-Test-Session': 'test-session' })
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response('', { status: 409 }))
    await fixture.componentInstance.reconcile()
    expect(fixture.componentInstance.answerState()).toBe('uncertain')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('La partie de test a été réinitialisée')
    const reload = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(button => button.textContent?.includes('Recharger l’aperçu'))!
    reload.click()
    await fixture.whenStable()
    expect(fixture.componentInstance.sessionChanged()).toBe(false)
    await fixture.componentInstance.openDoor()
    expect(fixture.componentInstance.answerState()).toBe('available')
  })

  it('attaches the session fence to every answer mutation', async () => {
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.choice.set(0)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
    await fixture.componentInstance.confirm()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available', generation: 'new' })))
    await fixture.componentInstance.replay()
    const mutations = vi.mocked(window.fetch).mock.calls.filter(([, options]) => options?.method === 'POST')
    for (const suffix of ['/answer/reconcile', '/answer/reserve', '/answer', '/answer/replay']) {
      const call = mutations.find(([url]) => String(url).endsWith(suffix))
      expect(call, suffix).toBeDefined()
      expect(call?.[1]?.headers).toMatchObject({ 'X-Advent-Test-Session': 'test-session' })
    }
  })
  it('shows a reveal after leaving an unavailable quiz', async () => {
    const component = fixture.componentInstance
    const result = { answerId: 'answer-one', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    component.unavailable.set(true)
    vi.mocked(window.fetch).mockImplementation(async input => {
      const url = String(input)
      if (url.endsWith('/next-day')) return new Response(JSON.stringify({ date: '2026-12-02' }))
      if (url.endsWith('/latest-unseen')) return new Response(JSON.stringify({ result }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' }))
      if (url.endsWith('/result')) return new Response(JSON.stringify(result))
      return new Response(JSON.stringify({ day: 1, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] }))
    })
    await component.advanceClock()
    fixture.detectChanges()
    expect(component.unavailable()).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('Bravo, tu as trouvé')
  })

  it('shows Christmas after leaving an unavailable quiz', async () => {
    const component = fixture.componentInstance
    component.unavailable.set(true)
    component.clockDate.set('2026-12-24')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    await component.advanceClock()
    fixture.detectChanges()
    expect(component.unavailable()).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('Joyeux Noël')
  })

  it('prioritizes a reveal and acknowledges only after it is rendered', async () => {
    const frames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length })
    const result = { answerId: 'answer-one', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockImplementation(async input => {
      const url = String(input)
      if (url.endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'test-session', testControls: true }))
      if (url.endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-02' }))
      if (url.endsWith('/latest-unseen') || url.endsWith('/result')) return new Response(JSON.stringify(url.endsWith('/result') ? result : { result }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: 'recorded', replayToken: 'token-one' }))
      if (url.endsWith('/acknowledge')) return new Response(null, { status: 200 })
      return new Response(JSON.stringify({ day: 1, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] }))
    })
    await fixture.componentInstance.start()
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/acknowledge'))).toBe(false)
    document.body.appendChild(fixture.nativeElement)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Bravo, tu as trouvé')
    expect(fixture.nativeElement.querySelector('.advent__result-points').textContent).toContain('+11 points gagnés')
    for (let i = 0; i < 20 && frames.length; i++) frames.shift()!(0)
    const ack = vi.mocked(window.fetch).mock.calls.find(([url]) => String(url).endsWith('/acknowledge'))!
    expect(JSON.parse(String(ack[1]?.body))).toEqual({ answerId: 'answer-one' })
  })

  it('shows only the points earned today, including participation and bonus', () => {
    const component = fixture.componentInstance
    component.resultContent.set({ day: 1, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'], genericElf: true })
    const result = { answerId: 'a', day: 1, selectedChoice: 0, falseChoice: 1, correct: false, responsePoints: 0, participationPoints: 1, bonusPoints: 0, totalPoints: 42, seen: true }
    component.result.set(result)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__result-points').textContent).toContain('+1 point gagné')
    expect(fixture.nativeElement.textContent).not.toContain('42 points')
    component.result.set({ ...result, explanation: 'Explication fictive' })
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Explication fictive')
    component.result.set(result)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain('Explication fictive')
    component.result.set({ ...result, correct: true, falseChoice: 0, responsePoints: 10, bonusPoints: 2 })
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__result-points').textContent).toContain('+13 points gagnés')
    expect(fixture.nativeElement.querySelectorAll('.advent__result-answer')).toHaveLength(1)
  })

  it('distinguishes the simulated day from the quiz date and continues without advancing', async () => {
    const component = fixture.componentInstance
    component.clockDate.set('2026-12-09')
    component.resultContent.set({ day: 8, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'], genericElf: true })
    component.result.set({ answerId: 'a', day: 8, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: true })
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__reveal .advent__date').textContent).toContain('8 décembre')
    const day = fixture.nativeElement.querySelector('.advent__simulated-day') as HTMLElement
    expect(day.textContent?.trim()).toBe('9 déc.')
    expect(day.getAttribute('aria-label')).toBe('Jour simulé : 9 décembre')
    vi.mocked(window.fetch).mockClear()
    vi.mocked(window.fetch).mockImplementation(async input => {
      const url = String(input)
      if (url.endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-09' }))
      if (url.endsWith('/session')) return new Response(JSON.stringify({ sessionId: 's', testControls: true }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: 'available' }))
      return new Response(JSON.stringify({ day: 9, name: 'Lutin du jour', portrait: '', statements: ['un', 'deux', 'trois'], genericElf: true }))
    })
    await component.continueAfterResult()
    fixture.detectChanges()
    expect(component.clockDate()).toBe('2026-12-09')
    expect(component.preview()?.day).toBe(9)
    expect(fixture.nativeElement.querySelector('[aria-label="Ouvrir le cadeau du jour 9"]')).toBeTruthy()
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).includes('/clock/next-day'))).toBe(false)
  })

  it('refreshes the shared clock before continuing after a result', async () => {
    const component = fixture.componentInstance
    component.result.set({ answerId: 'a', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false })
    component.clockDate.set('2026-12-02')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ date: '2026-12-25' })))
    await component.continueAfterResult()
    fixture.detectChanges()
    expect(component.clockDate()).toBe('2026-12-25')
    expect(component.result()).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Joyeux Noël')
  })

  it('keeps the result visible if refreshing the clock fails', async () => {
    const component = fixture.componentInstance
    component.result.set({ answerId: 'a', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false })
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('offline'))
    await component.continueAfterResult()
    expect(component.result()?.answerId).toBe('a')
    expect(component.error()).toBe(true)
  })

  it('uses the revealed answer day and its replay token', async () => {
    const component = fixture.componentInstance
    const result = { answerId: 'a', day: 3, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockImplementation(async (input, options) => {
      const url = String(input)
      if (url.endsWith('/3/answer/replay')) return new Response(JSON.stringify({ status: 'available' }))
      if (url.endsWith('/reconcile')) return new Response(JSON.stringify({ status: 'available', generation: 'new' }))
      if (url.endsWith('/3/answer')) return new Response(JSON.stringify({ status: 'recorded', replayToken: 'right-token' }))
      if (url.endsWith('/3/result')) return new Response(JSON.stringify(result))
      return new Response(JSON.stringify({ day: 3, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] }))
    })
    await (component as any).showResult(result)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Effacer ma réponse et rejouer"]')).toBeTruthy()
    await component.replay()
    const call = vi.mocked(window.fetch).mock.calls.find(([url]) => String(url).endsWith('/replay'))!
    expect(String(call[0])).toContain('/doors/3/')
    expect(JSON.parse(String(call[1]?.body))).toEqual({ replayToken: 'right-token' })
    expect(component.result()).toBeNull()
    expect(component.answerState()).toBe('available')
  })

  it('does not display a result after the session changes during content retrieval', async () => {
    const component = fixture.componentInstance
    const result = { answerId: 'a', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ day: 1, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
      .mockResolvedValueOnce(new Response('', { status: 409 }))
    await expect((component as any).showResult(result)).rejects.toThrow()
    expect(component.result()).toBeNull()
    expect(component.sessionChanged()).toBe(true)
  })

  it('waits for a visible tab before acknowledging a displayed reveal', async () => {
    let visibility: DocumentVisibilityState = 'hidden'
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility)
    const frames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length })
    const result = { answerId: 'a', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ day: 1, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
    await (fixture.componentInstance as any).showResult(result)
    document.body.appendChild(fixture.nativeElement)
    fixture.detectChanges()
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/acknowledge'))).toBe(false)
    visibility = 'visible'
    document.dispatchEvent(new Event('visibilitychange'))
    for (let i = 0; i < 20 && frames.length; i++) frames.shift()!(0)
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/acknowledge'))).toBe(true)
  })

  it('clears the old quiz on Christmas when advancing without a reveal', async () => {
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.selectedDay.set(24)
    fixture.componentInstance.clockDate.set('2026-12-24')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    await fixture.componentInstance.nextDay()
    fixture.detectChanges()
    expect(fixture.componentInstance.quiz()).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Joyeux Noël')
  })

  it('times out a stalled direct result lookup', async () => {
    vi.useFakeTimers()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ day: 2, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: 'test-session', testControls: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
      .mockReturnValueOnce(new Promise(() => {}))
    const selection = fixture.componentInstance.selectDay(2)
    await vi.advanceTimersByTimeAsync(10_000)
    await selection
    expect(fixture.componentInstance.loading()).toBe(false)
    expect(fixture.componentInstance.error()).toBe(true)
  })

  it('keeps the reveal when its replay token has become stale', async () => {
    const component = fixture.componentInstance
    const result = { answerId: 'a', day: 3, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ day: 3, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'old-token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'new-token' })))
    await (component as any).showResult(result)
    await component.replay()
    expect(component.result()?.answerId).toBe('a')
    expect(component.error()).toBe(true)
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/reconcile'))).toBe(false)
  })

  it('advances the shared clock when the forward arrow is on the current day', async () => {
    vi.mocked(window.fetch).mockClear()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    await fixture.componentInstance.nextDay()
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/clock/next-day'))).toBe(false)
    expect(vi.mocked(window.fetch).mock.calls.some(([url, options]) => String(url).endsWith('/results/latest-unseen') && (options?.headers as Record<string, string>)?.['X-Advent-Simulated-Date'] === '2026-12-02')).toBe(true)
    expect(fixture.componentInstance.selectedDay()).toBe(2)
  })

  it('opens the current day when the clock advances without a reveal', async () => {
    await fixture.componentInstance.openDoor()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    await fixture.componentInstance.advanceClock()
    expect(fixture.componentInstance.selectedDay()).toBe(2)
    expect(fixture.componentInstance.quiz()).toBeNull()
    expect(fixture.componentInstance.preview()?.day).toBe(2)
  })

})

describe('Advent member journey', () => {
  let fixture: ComponentFixture<AdventTest>
  beforeEach(async () => {
    vi.spyOn(window, 'fetch').mockImplementation(async (input, options) => {
      const url = String(input)
      if (url.endsWith('/session')) return new Response(JSON.stringify({ testControls: false, sessionId: 'member-session' }))
      if (url.endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-02' }))
      if (url.endsWith('/results/latest-unseen')) return new Response(JSON.stringify({ result: null }))
      if (url.endsWith('/answer/reconcile')) return new Response(JSON.stringify({ status: 'available', generation: 'member-generation' }))
      if (url.endsWith('/answer/reserve')) return new Response(JSON.stringify({ status: 'available' }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: options?.method === 'POST' ? 'recorded' : 'available' }))
      if (url.endsWith('/ranking')) return new Response(JSON.stringify({ ranking: { score: 0, rank: 2, entries: [{ name: 'Camille', score: 0, rank: 2, mine: true }] }, priorityResult: null }))
      return new Response(JSON.stringify({ day: 2, name: 'Camille', portrait: '', statements: ['un', 'deux', 'trois'] }))
    })
    await TestBed.configureTestingModule({ imports: [AdventTest], providers: [provideRouter([])] }).compileComponents()
    fixture = TestBed.createComponent(AdventTest)
    fixture.detectChanges()
    await fixture.whenStable()
    await new Promise(resolve => setTimeout(resolve, 0))
    fixture.detectChanges()
  })
  afterEach(() => { vi.restoreAllMocks() })
  it('uses the member API with a nonprivileged session and shows only revealed score', async () => {
    expect(fixture.nativeElement.textContent).not.toContain('Mode test')
    expect(fixture.nativeElement.querySelector('[aria-label="Avancer au jour suivant"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Réinitialiser la partie de développement"]')).toBeNull()
    expect(vi.mocked(window.fetch).mock.calls.every(call => !String(call[0]).includes('advent-test'))).toBe(true)
    await fixture.componentInstance.openDoor()
    fixture.componentInstance.choice.set(0)
    await fixture.componentInstance.confirm()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Voir le classement')
    await fixture.componentInstance.openRanking()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Ton score actuel : 0 points')
    expect(fixture.nativeElement.textContent).not.toContain('tous les points enregistrés')
  })
  it('reloads a stale ordinary member page with a refreshed game session', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response('', { status: 409 }))
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.componentInstance.sessionChanged()).toBe(true)
    const reload = [...fixture.nativeElement.querySelectorAll('button')].find((button: any) => button.textContent.includes('Recharger l’aperçu')) as HTMLButtonElement
    reload.click()
    await fixture.whenStable()
    await new Promise(resolve => setTimeout(resolve, 0))
    fixture.detectChanges()
    expect(fixture.componentInstance.sessionChanged()).toBe(false)
    const clockRequest = vi.mocked(window.fetch).mock.calls.filter(call => String(call[0]).endsWith('/clock')).at(-1)
    expect((clockRequest?.[1]?.headers as Record<string, string>)['X-Advent-Test-Session']).toBe('member-session')
  })
  it.each(['2026-12-25', '2027-01-15'])('opens the final ranking on %s without an answer', async date => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ testControls: false, sessionId: 'member-session' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ date })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ranking: { score: 0, rank: 2, entries: [] }, priorityResult: null })))
    await fixture.componentInstance.start()
    fixture.detectChanges()
    const button = fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement
    expect(button.textContent).toContain('Voir le classement')
    button.click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Classement amical')
    fixture.componentInstance.closeRanking(true)
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement?.textContent).toContain('Voir le classement')
  })
  it('keeps a newly revealable result ahead of the final ranking', async () => {
    const result = { answerId: 'final-answer', day: 24, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ testControls: false, sessionId: 'member-session' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ date: '2026-12-25' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ranking: null, priorityResult: result })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ day: 24, name: 'Lutin', portrait: '', statements: ['un', 'deux', 'trois'] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    await fixture.componentInstance.start()
    await fixture.componentInstance.openRanking()
    fixture.detectChanges()
    expect(fixture.componentInstance.rankingOpen()).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('Bravo, tu as trouvé')
  })

})
