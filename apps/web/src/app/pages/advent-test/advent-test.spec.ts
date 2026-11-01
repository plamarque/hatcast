import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdventTest } from './advent-test'
import { AuthApiService, UserSummary } from '../../core/auth/auth-api.service'
import { WritableSignal } from '@angular/core'

describe('AdventTest', () => {
  let fixture: ComponentFixture<AdventTest>
  beforeEach(async () => {
    vi.spyOn(window, 'fetch').mockImplementation(async input => {
      if (String(input).endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'test-session', testControls: true }), { status: 200 })
      if (String(input).endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-01' }))
      if (String(input).endsWith('/results/latest-unseen')) return new Response(JSON.stringify({ result: null }))
      if (String(input).endsWith('/ranking')) return new Response(JSON.stringify({ priorityResult: null, ranking: { score: 0, rank: null, entries: [] } }))
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
    fixture.componentInstance.testMode.set(true) // Existing operator scenarios opt in explicitly.
    fixture.detectChanges()
  })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })
  it('starts opted out, enables controls outside the member window, then reloads without resetting', async () => {
    const component = fixture.componentInstance
    component.testMode.set(false)
    vi.mocked(window.fetch).mockClear().mockImplementation(async (input, options) => {
      const url = String(input)
      if (url.endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'same', testControls: true }))
      if (url.endsWith('/clock')) return (options?.headers as Record<string, string>)?.['X-Advent-Test-Mode']
        ? new Response(JSON.stringify({ date: '2026-12-01' })) : new Response('', { status: 404 })
      if (url.endsWith('/latest-unseen')) return new Response(JSON.stringify({ result: null }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: 'available' }))
      return new Response(JSON.stringify({ day: 1, name: 'Fictif', portrait: '', statements: ['A', 'B', 'C'] }))
    })
    await component.start(); fixture.detectChanges()
    expect(component.testMode()).toBe(false)
    expect(component.unavailable()).toBe(true)
    expect(fixture.nativeElement.querySelector('.advent__test-actions')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Activer le mode test"]').getAttribute('aria-pressed')).toBe('false')
    await component.toggleTestMode(); fixture.detectChanges()
    expect(component.testMode()).toBe(true)
    expect(component.preview()?.day).toBe(1)
    expect(fixture.nativeElement.querySelector('.advent__test-actions')).not.toBeNull()
    expect(vi.mocked(window.fetch).mock.calls.some(([url, options]) => String(url).endsWith('/clock') && (options?.headers as Record<string, string>)?.['X-Advent-Simulated-Date'] === '2026-12-01')).toBe(true)
    await component.toggleTestMode(); fixture.detectChanges()
    expect(component.unavailable()).toBe(true)
    expect(component.testMode()).toBe(false)
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/session/reset'))).toBe(false)
  })

  it('blocks a mode switch while a mutation is in flight', async () => {
    const component = fixture.componentInstance
    component.testMode.set(false)
    let resolve!: (response: Response) => void
    vi.mocked(window.fetch).mockImplementationOnce(() => new Promise<Response>(r => { resolve = r }))
    const mutation = component.reconcile()
    await component.toggleTestMode()
    expect(component.testMode()).toBe(false)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Activer le mode test"]').disabled).toBe(true)
    resolve(new Response(JSON.stringify({ status: 'available', generation: 'next' })))
    await mutation
    expect(component.pendingMutations()).toBe(0)
  })

  it.each(['calendar', 'ranking'] as const)('reloads the %s projection when switching mode', async screen => {
    const component = fixture.componentInstance
    component.calendarOpen.set(screen === 'calendar')
    component.rankingOpen.set(screen === 'ranking')
    const requested: { url: string; mode?: string }[] = []
    vi.mocked(window.fetch).mockImplementation(async (input, options) => {
      const url = String(input)
      requested.push({ url, mode: (options?.headers as Record<string, string>)?.['X-Advent-Test-Mode'] })
      if (url.endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'same', testControls: true }))
      if (url.endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-01' }))
      if (url.endsWith('/latest-unseen')) return new Response(JSON.stringify({ result: null }))
      if (url.endsWith('/calendar')) return new Response(JSON.stringify({ days: [{ day: 1, state: 'today' }], priorityResult: null }))
      if (url.endsWith('/ranking')) return new Response(JSON.stringify({ priorityResult: null, ranking: { score: 0, rank: 1, entries: [] } }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: 'available' }))
      return new Response(JSON.stringify({ day: 1, name: 'Fictif', portrait: '', statements: ['A', 'B', 'C'] }))
    })
    await component.toggleTestMode()
    expect(component.testMode()).toBe(false)
    expect(screen === 'calendar' ? component.calendarOpen() : component.rankingOpen()).toBe(true)
    expect(requested.some(call => call.url.endsWith(`/${screen}`) && !call.mode)).toBe(true)
  })

  it('gives a priority reveal precedence over restoring the previous screen', async () => {
    const component = fixture.componentInstance
    component.rankingOpen.set(true)
    const result = { answerId: 'reveal', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    vi.mocked(window.fetch).mockImplementation(async input => {
      const url = String(input)
      if (url.endsWith('/session')) return new Response(JSON.stringify({ sessionId: 'same', testControls: true }))
      if (url.endsWith('/clock')) return new Response(JSON.stringify({ date: '2026-12-02' }))
      if (url.endsWith('/latest-unseen')) return new Response(JSON.stringify({ result }))
      if (url.endsWith('/answer')) return new Response(JSON.stringify({ status: 'recorded' }))
      if (url.endsWith('/result')) return new Response(JSON.stringify(result))
      return new Response(JSON.stringify({ day: 1, name: 'Fictif', portrait: '', statements: ['A', 'B', 'C'] }))
    })
    await component.toggleTestMode()
    expect(component.result()?.answerId).toBe('reveal')
    expect(component.rankingOpen()).toBe(false)
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/ranking'))).toBe(false)
  })

  it('does not restore an old screen after identity changes during a mode switch', async () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true)
    let finish!: () => void
    vi.spyOn(component, 'start').mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve })).mockResolvedValue()
    const open = vi.spyOn(component, 'openCalendar')
    const switching = component.toggleTestMode()
    const auth = TestBed.inject(AuthApiService) as unknown as { sessionUserSignal: WritableSignal<UserSummary | null> }
    auth.sessionUserSignal.set({ id: 'new', slug: 'new', email: null, displayName: 'Nouvelle' })
    fixture.detectChanges()
    finish()
    await switching
    expect(open).not.toHaveBeenCalled()
  })

  it('keeps calendar and ranking navigation off the door and question, then offers ranking after confirmation', async () => {
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Voir le calendrier')
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Voir le calendrier')
    fixture.componentInstance.answerState.set('recorded')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain('Voir le calendrier')
    expect(fixture.nativeElement.textContent).toContain('Voir le classement')
  })

  it('offers both destinations when content is missing without changing priority reveal', async () => {
    fixture.componentInstance.unavailable.set(true)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Voir le calendrier"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Voir le classement')
    fixture.componentInstance.unavailable.set(false)
    fixture.componentInstance.result.set({ answerId: 'a', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false })
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Voir le calendrier"]').disabled).toBe(true)
    expect(fixture.nativeElement.querySelector('[aria-label="Classement"]').disabled).toBe(true)
  })

  it('offers calendar from ranking and returns to ranking from calendar', async () => {
    const days = Array.from({ length: 25 }, (_, i) => ({ day: i + 1, state: i === 0 ? 'played' : i === 1 ? 'today' : 'locked' }))
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ days, priorityResult: null })))
    await fixture.componentInstance.openCalendar()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Classement"]')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('[data-state="played"]').getAttribute('aria-label')).toContain('résultat en attente')
    expect(fixture.nativeElement.querySelector('[data-state="locked"]').getAttribute('aria-label')).toContain('Verrouillé')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ priorityResult: null, ranking: { score: 0, rank: null, entries: [] } })))
    await fixture.componentInstance.openRanking()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Voir le calendrier"]')).not.toBeNull()
  })

  it('describes pending and revealed gifts without relying on color', () => {
    const component = fixture.componentInstance
    component.calendarDays.set([
      { day: 1, state: 'played', outcome: 'pending' },
      { day: 2, state: 'played', outcome: 'correct' },
      { day: 3, state: 'played', outcome: 'incorrect' },
      { day: 4, state: 'past-unplayed' },
      { day: 5, state: 'missing' },
    ])
    component.calendarOpen.set(true)
    fixture.detectChanges()
    const buttons = fixture.nativeElement.querySelectorAll('.advent__calendar-door') as NodeListOf<HTMLButtonElement>
    expect(buttons[0].getAttribute('aria-label')).toContain('résultat en attente')
    expect(buttons[1].getAttribute('aria-label')).toContain('Bonne réponse')
    expect(buttons[1].querySelector('.advent__gift-caption')?.textContent?.trim()).toBe('2')
    expect(buttons[2].getAttribute('aria-label')).toContain('Mauvaise réponse')
    expect(buttons[2].querySelector('.advent__gift-caption')?.textContent?.trim()).toBe('3')
    expect(buttons[3].getAttribute('aria-label')).toContain('Cadeau fermé')
    expect(buttons[4].getAttribute('aria-label')).toContain('Sans contenu')
  })

  it('ignores a calendar response after the component is restarted', async () => {
    let resolve!: (response: Response) => void
    vi.mocked(window.fetch).mockImplementationOnce(() => new Promise<Response>(r => { resolve = r }))
    const pending = fixture.componentInstance.openCalendar()
    const restart = fixture.componentInstance.start()
    resolve(new Response(JSON.stringify({ days: [{ day: 1, state: 'played', outcome: 'correct' }], priorityResult: null })))
    await Promise.all([pending, restart])
    expect(fixture.componentInstance.calendarDays()).toEqual([])
    expect(fixture.componentInstance.calendarOpen()).toBe(false)
    expect(fixture.componentInstance.error()).toBe(false)
  })

  it('clears the previous account and ignores a delayed calendar failure', async () => {
    const auth = TestBed.inject(AuthApiService) as unknown as { sessionUserSignal: WritableSignal<UserSummary | null> }
    const component = fixture.componentInstance
    component.calendarDays.set([{ day: 1, state: 'played', outcome: 'correct' }])
    let reject!: (reason: Error) => void
    vi.mocked(window.fetch).mockImplementationOnce(() => new Promise<Response>((_, r) => { reject = r }))
    const oldRequest = component.openCalendar()
    auth.sessionUserSignal.set({ id: 'new', slug: 'new', email: null, displayName: 'Nouvelle' })
    fixture.detectChanges()
    expect(component.calendarDays()).toEqual([])
    reject(new Error('network'))
    await oldRequest
    await fixture.whenStable()
    expect(component.error()).toBe(false)
    expect(component.calendarDays()).toEqual([])
    expect(component.calendarOpen()).toBe(false)
  })

  it('does not clear loading or show an error when an old request fails during a new session', async () => {
    let rejectOld!: (reason: Error) => void
    let resolveNew!: (response: Response) => void
    vi.mocked(window.fetch).mockImplementationOnce(() => new Promise<Response>((_, reject) => { rejectOld = reject }))
      .mockImplementationOnce(() => new Promise<Response>(resolve => { resolveNew = resolve }))
    const oldRequest = fixture.componentInstance.openCalendar()
    const newRequest = fixture.componentInstance.start()
    rejectOld(new Error('offline'))
    await oldRequest
    expect(fixture.componentInstance.loading()).toBe(true)
    expect(fixture.componentInstance.error()).toBe(false)
    resolveNew(new Response(JSON.stringify({ sessionId: 'fresh', testControls: false })))
    await newRequest
    expect(fixture.componentInstance.error()).toBe(false)
  })

  it('discards a delayed revealed calendar after a simulated date rollback', async () => {
    const component = fixture.componentInstance
    let resolve!: (response: Response) => void
    vi.mocked(window.fetch).mockImplementationOnce(() => new Promise<Response>(r => { resolve = r }))
    const oldRequest = component.openCalendar()
    const rollback = (component as unknown as { enterAt(date: string): Promise<void> }).enterAt('2026-12-01')
    resolve(new Response(JSON.stringify({ days: [{ day: 1, state: 'played', outcome: 'correct' }], priorityResult: null })))
    await Promise.all([oldRequest, rollback])
    expect(component.calendarDays()).toEqual([])
    expect(component.error()).toBe(false)
    expect(component.clockDate()).toBe('2026-12-01')
  })

  it('keeps the calendar visible after an operator changes its simulated day', async () => {
    const component = fixture.componentInstance
    component.testControls.set(true)
    component.clockDate.set('2026-12-02')
    component.calendarOpen.set(true)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ days: [{ day: 1, state: 'past-unplayed' }, { day: 2, state: 'today' }], priorityResult: null })))
    await component.previousDay()
    expect(component.clockDate()).toBe('2026-12-01')
    expect(component.calendarOpen()).toBe(true)
    expect(component.calendarDays()).toHaveLength(2)
  })

  it('opens the gift for an unplayed past day without revealing the false statement', async () => {
    const component = fixture.componentInstance
    component.clockDate.set('2026-12-02')
    component.testControls.set(false); component.testMode.set(false)
    const quiz = { day: 1, name: 'Alex', portrait: '', statements: ['A', 'B', 'C'] }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ quiz, falseChoice: null, result: null, priorityResult: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify(quiz)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
    await component.openCalendarDay({ day: 1, state: 'past-unplayed' })
    fixture.detectChanges()
    expect(component.lateDiscovery()).toBe(true)
    expect(component.preview()?.day).toBe(1)
    expect(fixture.nativeElement.textContent).not.toContain('anecdote fausse')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available', generation: 'fresh' })))
    await component.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('sans gagner de points')
    const call = vi.mocked(window.fetch).mock.calls.find(([url]) => String(url).endsWith('/answer/reconcile'))!
    expect(JSON.parse(String(call[1]?.body))).toEqual({ late: true })
  })

  it('opens a played past day on the personal result without celebration and retains operator replay', async () => {
    const component = fixture.componentInstance
    component.clockDate.set('2026-12-02')
    const result = { answerId: 'answer-one', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    const quiz = { day: 1, name: 'Fictif', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ quiz, falseChoice: 0, result, priorityResult: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify(quiz)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'answer-one' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    await component.openCalendarDay({ day: 1, state: 'played' })
    fixture.detectChanges()
    expect(component.result()?.answerId).toBe('answer-one')
    expect(component.historicalResult()).toBe(true)
    expect(fixture.nativeElement.querySelector('.advent__confetti')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Effacer ma réponse et rejouer"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Retour au calendrier')
    expect(fixture.nativeElement.querySelector('[aria-label="Voir le calendrier"]')).not.toBeNull()
  })

  it('shows an immediately revealed zero point result after late confirmation', async () => {
    const component = fixture.componentInstance
    component.testControls.set(false); component.testMode.set(false)
    component.clockDate.set('2026-12-02')
    component.lateDiscovery.set(true)
    component.selectedDay.set(1)
    component.quiz.set({ day: 1, name: 'Fictif', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] })
    component.choice.set(0)
    component.answerState.set('available')
    ;(component as any).generation = 'fresh'
    const result = { answerId: 'late', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 0, participationPoints: 0, bonusPoints: 0, totalPoints: 0, seen: true, late: true }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', late: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
      .mockResolvedValueOnce(new Response(JSON.stringify(component.quiz())))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', late: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    await component.confirm()
    fixture.detectChanges()
    expect(component.result()?.late).toBe(true)
    expect(fixture.nativeElement.textContent).toContain('réponse après le jour du quiz')
    expect(fixture.nativeElement.querySelector('.advent__confetti')).toBeNull()
  })

  it('recovers an interrupted late confirmation through reconciliation', async () => {
    const component = fixture.componentInstance
    component.testControls.set(false); component.testMode.set(false); component.clockDate.set('2026-12-02'); component.selectedDay.set(1); component.lateDiscovery.set(true)
    const quiz = { day: 1, name: 'Fictif', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] }
    const result = { answerId: 'late', day: 1, selectedChoice: 0, falseChoice: 1, correct: false, responsePoints: 0, participationPoints: 0, bonusPoints: 0, totalPoints: 0, seen: true, late: true }
    component.quiz.set(quiz); component.choice.set(0); component.answerState.set('available'); (component as any).generation = 'fresh'
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
      .mockRejectedValueOnce(new Error('lost confirmation'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', late: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
      .mockResolvedValueOnce(new Response(JSON.stringify(quiz)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', late: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    await component.confirm()
    expect(component.result()?.answerId).toBe('late')
    expect(component.result()?.responsePoints).toBe(0)
  })

  it('uses open artwork only for recorded answers and keeps a fallback on image failure', () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true)
    component.calendarDays.set([{ day: 1, state: 'past-unplayed' }, { day: 2, state: 'played', outcome: 'pending' }, { day: 3, state: 'locked' }])
    fixture.detectChanges()
    const images = fixture.nativeElement.querySelectorAll('.advent__gift-art') as NodeListOf<HTMLImageElement>
    expect(images[0].getAttribute('src')).toContain('gift-closed')
    expect(images[1].getAttribute('src')).toContain('gift-open')
    expect(images[2].getAttribute('src')).toContain('gift-closed')
    images[1].dispatchEvent(new Event('error'))
    expect(images[1].hidden).toBe(true)
    expect(images[1].parentElement?.querySelector('.advent__gift-lid')).toBeTruthy()
    expect(images[1].closest('button')?.getAttribute('aria-label')).toContain('2 décembre')
    component.calendarDays.set([{ day: 1, state: 'past-unplayed' }, { day: 2, state: 'past-unplayed' }, { day: 3, state: 'locked' }])
    fixture.detectChanges()
    expect(images[1].getAttribute('src')).toContain('gift-closed')
    images[1].dispatchEvent(new Event('load'))
    expect(images[1].hidden).toBe(false)
  })

  it('distinguishes the current day from earlier played days', async () => {
    const component = fixture.componentInstance
    component.clockDate.set('2026-12-06')
    component.calendarOpen.set(true)
    component.calendarDays.set([{ day: 5, state: 'played' }, { day: 6, state: 'played' }])
    fixture.detectChanges()
    const doors = fixture.nativeElement.querySelectorAll('.advent__calendar-door') as NodeListOf<HTMLButtonElement>
    expect(doors[0].getAttribute('data-today')).toBe('false')
    expect(doors[1].getAttribute('data-today')).toBe('true')
    expect(doors[1].getAttribute('aria-label')).toContain('aujourd’hui')
    component.clockDate.set('2026-12-05')
    fixture.detectChanges()
    expect(doors[0].getAttribute('data-today')).toBe('true')
    expect(doors[1].getAttribute('data-today')).toBe('false')
  })

  it('lets only an operator close one played case without leaving the calendar', async () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true)
    component.clockDate.set('2026-12-01')
    component.calendarDays.set([{ day: 1, state: 'played' }, { day: 2, state: 'past-unplayed' }, { day: 3, state: 'played' }])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelectorAll('[aria-label="Refermer mon cadeau du jour et effacer ma réponse"]')).toHaveLength(1)
    expect(fixture.nativeElement.querySelector('.advent__calendar-door button')).toBeNull()
    component.testControls.set(false); component.testMode.set(false); fixture.detectChanges()
    expect(fixture.nativeElement.querySelectorAll('[aria-label="Refermer mon cadeau du jour et effacer ma réponse"]')).toHaveLength(0)
    component.testControls.set(true); component.testMode.set(true); fixture.detectChanges()
    vi.mocked(window.fetch).mockClear().mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'own-answer' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'cleared' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ days: [{ day: 1, state: 'past-unplayed' }, { day: 2, state: 'past-unplayed' }, { day: 3, state: 'played' }], priorityResult: null })))
    await component.closeCalendarDay()
    fixture.detectChanges()
    const call = vi.mocked(window.fetch).mock.calls.find(([url]) => String(url).endsWith('/1/answer/replay'))!
    expect(JSON.parse(String(call[1]?.body))).toEqual({ replayToken: 'own-answer', close: true })
    expect(component.calendarOpen()).toBe(true)
    expect(component.calendarDays()[0].state).toBe('past-unplayed')
    expect(component.calendarDays()[2].state).toBe('played')
    expect(component.calendarActionMessage()).toContain('case 1 est refermée')
  })

  it('only enables reset for the played exact December date and refuses other dates', async () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true)
    component.calendarDays.set([{ day: 1, state: 'played' }, { day: 2, state: 'today' }, { day: 24, state: 'played' }])
    for (const date of ['2026-12-02', '2026-12-25', '2027-01-01']) {
      component.clockDate.set(date); fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('[aria-label="Refermer mon cadeau du jour et effacer ma réponse"]')).toBeNull()
      vi.mocked(window.fetch).mockClear()
      await component.closeCalendarDay()
      expect(window.fetch).not.toHaveBeenCalled()
    }
    component.clockDate.set('2026-12-24'); fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Refermer mon cadeau du jour et effacer ma réponse"]').disabled).toBe(false)
    component.closingDay.set(24); fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Refermer mon cadeau du jour et effacer ma réponse"]').disabled).toBe(true)
  })

  it('disables both date arrows during a delayed daily reset and keeps the date', async () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true); component.clockDate.set('2026-12-10')
    component.calendarDays.set([{ day: 10, state: 'played' }])
    let resolve!: (response: Response) => void
    vi.mocked(window.fetch).mockClear().mockImplementationOnce(() => new Promise<Response>(r => { resolve = r }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'cleared' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ days: [{ day: 10, state: 'today' }], priorityResult: null })))
    const closing = component.closeCalendarDay()
    fixture.detectChanges()
    const previous = fixture.nativeElement.querySelector('[aria-label="Revenir au jour précédent"]') as HTMLButtonElement
    const next = fixture.nativeElement.querySelector('[aria-label="Avancer au jour suivant"]') as HTMLButtonElement
    expect(previous.disabled).toBe(true); expect(next.disabled).toBe(true)
    previous.click(); next.click()
    await component.previousDay(); await component.nextDay()
    expect(component.clockDate()).toBe('2026-12-10')
    expect(vi.mocked(window.fetch)).toHaveBeenCalledTimes(1)
    resolve(new Response(JSON.stringify({ status: 'recorded', replayToken: 'own' })))
    await closing
    expect(component.clockDate()).toBe('2026-12-10')
  })

  it('does not send a replay if the identity changes while obtaining the token', async () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true); component.clockDate.set('2026-12-01')
    component.calendarDays.set([{ day: 1, state: 'played' }])
    let resolve!: (response: Response) => void
    vi.mocked(window.fetch).mockClear().mockImplementationOnce(() => new Promise<Response>(r => { resolve = r }))
    const closing = component.closeCalendarDay()
    const auth = TestBed.inject(AuthApiService) as unknown as { sessionUserSignal: WritableSignal<UserSummary | null> }
    auth.sessionUserSignal.set({ id: 'other', slug: 'other', email: null, displayName: 'Autre' })
    fixture.detectChanges()
    resolve(new Response(JSON.stringify({ status: 'recorded', replayToken: 'old' })))
    await closing
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url).endsWith('/answer/replay'))).toBe(false)
  })

  it('refuses a close when the answer changed and reloads the calendar', async () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true); component.clockDate.set('2026-12-01'); component.calendarDays.set([{ day: 1, state: 'played' }])
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'old' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'stale' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ days: [{ day: 1, state: 'played' }], priorityResult: null })))
    await component.closeCalendarDay()
    expect(component.calendarOpen()).toBe(true)
    expect(component.calendarActionMessage()).toContain('Impossible')
    fixture.detectChanges()
    const feedback = fixture.nativeElement.querySelector('[role="status"][aria-live="polite"].advent__feedback') as HTMLElement
    expect(feedback.textContent).toContain('Impossible de refermer')
    expect(feedback.classList.contains('advent__visually-hidden')).toBe(false)
  })

  it('honors a priority revelation returned while closing a calendar case', async () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true); component.clockDate.set('2026-12-01'); component.calendarDays.set([{ day: 1, state: 'played' }])
    const result = { answerId: 'other', day: 2, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    const quiz = { day: 2, name: 'Fictif', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] }
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'own' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'priority', priorityResult: result })))
      .mockResolvedValueOnce(new Response(JSON.stringify(quiz)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'other' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    await component.closeCalendarDay()
    expect(component.calendarOpen()).toBe(false)
    expect(component.result()?.answerId).toBe('other')
  })

  it.each(['calendar', 'ranking'])('shows priority revelation above the previous %s view', async previous => {
    const component = fixture.componentInstance
    const result = { answerId: 'priority', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false }
    const quiz = { day: 1, name: 'Fictif', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] }
    component.calendarOpen.set(previous === 'calendar')
    component.rankingOpen.set(previous === 'ranking')
    if (previous === 'ranking') component.ranking.set({ score: 0, rank: null, entries: [] })
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ priorityResult: result })))
      .mockResolvedValueOnce(new Response(JSON.stringify(quiz)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'priority' })))
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
    if (previous === 'calendar') await component.openRanking()
    else await component.openCalendar()
    fixture.detectChanges()
    expect(component.calendarOpen()).toBe(false)
    expect(component.rankingOpen()).toBe(false)
    expect(fixture.nativeElement.querySelector('#advent-result-title')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('#advent-calendar-panel')).toBeNull()
    expect(fixture.nativeElement.querySelector('#advent-ranking-panel')).toBeNull()
  })

  it('keeps the calendar and offers retry when loading the Christmas score fails', async () => {
    const component = fixture.componentInstance
    component.clockDate.set('2026-12-25'); component.calendarOpen.set(true)
    component.calendarDays.set([{ day: 25, state: 'christmas' }])
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response('', { status: 503 })).mockResolvedValueOnce(new Response('', { status: 503 }))
    await component.openCalendarDay({ day: 25, state: 'christmas' })
    fixture.detectChanges()
    expect(component.calendarOpen()).toBe(true)
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('score de Noël')
    expect([...fixture.nativeElement.querySelectorAll('button')].some((button: any) => button.textContent.includes('Réessayer'))).toBe(true)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ ranking: { score: 0, rank: null, entries: [] }, priorityResult: null })))
    await component.openCalendarDay({ day: 25, state: 'christmas' })
    fixture.detectChanges()
    expect(component.calendarOpen()).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('Joyeux Noël')
    expect(fixture.nativeElement.textContent).toContain('0 points')
  })

  it('describes missing cases with an accessible label', () => {
    const component = fixture.componentInstance
    component.calendarOpen.set(true)
    component.calendarDays.set([{ day: 1, state: 'missing' }, { day: 2, state: 'past-unplayed' }])
    fixture.detectChanges()
    const missing = fixture.nativeElement.querySelector('[data-state="missing"]')
    const past = fixture.nativeElement.querySelector('[data-state="past-unplayed"]')
    expect(missing.getAttribute('aria-label')).toContain('Sans contenu')
    expect(missing.querySelector('.advent__gift-caption').textContent.trim()).toBe('1')
    expect(past.querySelector('mat-icon')).toBeNull()
  })

  it('retries a timed-out priority lookup before opening the selected quiz', async () => {
    vi.useFakeTimers()
    vi.mocked(window.fetch).mockReturnValueOnce(new Promise(() => {}))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
    const entry = fixture.componentInstance.nextDay()
    await vi.advanceTimersByTimeAsync(10_000)
    await entry
    expect(fixture.componentInstance.preview()?.day).toBe(2)
    expect(vi.mocked(window.fetch).mock.calls.filter(([url]) => String(url).endsWith('/latest-unseen')).length).toBeGreaterThanOrEqual(2)
  })
  it('retries an interrupted response body but not invalid JSON', async () => {
    const request = (fixture.componentInstance as any).requestJson.bind(fixture.componentInstance)
    const interrupted = new Response('{}')
    vi.spyOn(interrupted, 'json').mockRejectedValueOnce(new TypeError('connection lost'))
    vi.mocked(window.fetch).mockClear().mockResolvedValueOnce(interrupted).mockResolvedValueOnce(new Response('{"date":"2026-12-02"}'))
    await expect(request('/v1/advent-test/clock', {})).resolves.toEqual({ date: '2026-12-02' })
    expect(vi.mocked(window.fetch)).toHaveBeenCalledTimes(2)
    vi.mocked(window.fetch).mockClear().mockResolvedValueOnce(new Response('invalid json'))
    await expect(request('/v1/advent-test/clock', {})).rejects.toThrow()
    expect(vi.mocked(window.fetch)).toHaveBeenCalledTimes(1)
  })
  it('does not retry client errors or mutation failures', async () => {
    const request = (fixture.componentInstance as any).requestJson.bind(fixture.componentInstance)
    vi.mocked(window.fetch).mockClear().mockResolvedValueOnce(new Response('', { status: 401 }))
    await expect(request('/v1/advent-test/clock', {})).rejects.toThrow()
    expect(vi.mocked(window.fetch)).toHaveBeenCalledTimes(1)
    vi.mocked(window.fetch).mockClear().mockRejectedValueOnce(new Error('offline'))
    await expect(request('/v1/advent-test/doors/1/answer', { method: 'POST' })).rejects.toThrow()
    expect(vi.mocked(window.fetch)).toHaveBeenCalledTimes(1)
  })
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
    const fallback = vi.mocked(window.fetch).getMockImplementation()!
    let failures = 0
    vi.mocked(window.fetch).mockImplementation((input, init) => {
      const target = failure === 'quiz' ? '/doors/2' : '/results/latest-unseen'
      if (String(input).endsWith(target) && failures++ < 2) return Promise.reject(new Error('network'))
      return fallback(input, init)
    })
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
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('network')).mockRejectedValueOnce(new Error('network'))
    await fixture.componentInstance.nextDay()
    fixture.detectChanges()
    expect(fixture.componentInstance.result()).toBeNull()
    expect(fixture.componentInstance.resultContent()).toBeNull()
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Bravo, tu as trouvé')
  })
  it('does not offer final ranking when the priority lookup fails on Christmas', async () => {
    fixture.componentInstance.clockDate.set('2026-12-24')
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('network')).mockRejectedValueOnce(new Error('network'))
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
  it('opens ranking from the header before answering', async () => {
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Classement"]')).not.toBeNull()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ priorityResult: null, ranking: { score: 0, rank: null, entries: [] } })))
    await fixture.componentInstance.openRanking()
    expect(fixture.componentInstance.rankingOpen()).toBe(true)
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
    expect(fixture.nativeElement.textContent).not.toContain('tous les points enregistrés')
    expect(fixture.nativeElement.querySelector('.advent__ranking-me .advent__ranking-person').textContent).toContain('Camille')
    expect(fixture.nativeElement.textContent).toContain('même si ta réponse est fausse')
    expect(fixture.nativeElement.textContent).toContain('10 points supplémentaires')
    fixture.componentInstance.closeRanking(true)
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement?.textContent).toContain('Voir le classement')
  })
  it('opens the calendar from the ranking action', async () => {
    fixture.componentInstance.ranking.set({ score: 0, rank: null, entries: [] })
    fixture.componentInstance.rankingOpen.set(true)
    fixture.detectChanges()
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ priorityResult: null, days: [] })))
    const button = fixture.nativeElement.querySelector('.advent__ranking-action button') as HTMLButtonElement
    expect(button.textContent).toContain('Voir le calendrier')
    button.click()
    await vi.waitFor(() => expect(fixture.componentInstance.calendarOpen()).toBe(true))
    expect(fixture.componentInstance.rankingOpen()).toBe(false)
  })
  it('reports a calendar loading failure from the ranking', async () => {
    fixture.componentInstance.ranking.set({ score: 0, rank: null, entries: [] })
    fixture.componentInstance.rankingOpen.set(true)
    fixture.detectChanges()
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('Network error'))
    ;(fixture.nativeElement.querySelector('.advent__ranking-action button') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(fixture.componentInstance.error()).toBe(true))
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Impossible de charger le calendrier')
  })
  it('identifies shared ranks without marking unique ranks as ties', () => {
    fixture.componentInstance.ranking.set({ score: 0, rank: 3, entries: [
      { name: 'Alex', score: 11, rank: 1, mine: false },
      { name: 'Camille', score: 0, rank: 3, mine: true },
      { name: 'Sophie', score: 0, rank: 3, mine: false },
    ] })
    fixture.componentInstance.rankingOpen.set(true)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.advent__ranking-summary').textContent).toContain('3 ex æquo')
    const rows = fixture.nativeElement.querySelectorAll('.advent__ranking-list li')
    expect(rows[1].querySelector('.advent__ranking-position').textContent).toContain('3')
    expect(rows[1].querySelector('.advent__ranking-tie').textContent).toContain('ex æquo')
    expect(rows[0].querySelector('.advent__ranking-tie')).toBeNull()
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
    expect(fixture.nativeElement.querySelector('.advent__state[role=status]').textContent).toContain('Il n’y a rien ici')
    expect(fixture.nativeElement.textContent).not.toContain('déconnecte-toi')
  })
  it('reports removal while reconciling or reserving', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'unavailable' })))
    await fixture.componentInstance.openDoor()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Il n’y a rien ici')
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()
  })
  it('reports removal during reservation and confirmation', async () => {
    const component = fixture.componentInstance
    await component.openDoor()
    component.choice.set(0)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'unavailable' })))
    await component.confirm()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Il n’y a rien ici')
    await component.selectDay(1)
    await component.openDoor()
    component.choice.set(0)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'unavailable' })))
    await component.confirm()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Il n’y a rien ici')
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
    expect(fixture.nativeElement.textContent).toContain('Il n’y a rien ici')
    expect(fixture.componentInstance.selectedDay()).toBe(1)
    await fixture.componentInstance.selectDay(fixture.componentInstance.selectedDay())
    expect(vi.mocked(window.fetch).mock.calls.some(([url]) => String(url) === '/v1/advent/doors/1')).toBe(true)
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
    expect(fixture.nativeElement.querySelector('.advent__loading[role=status]').textContent).toContain('Noël approche')
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

  it('requests the quiz and answer state together and handles a reset during loading', async () => {
    let resolveContent!: (response: Response) => void
    let resolveState!: (response: Response) => void
    vi.mocked(window.fetch).mockImplementation(input => {
      if (String(input).endsWith('/doors/2')) return new Promise(resolve => { resolveContent = resolve })
      if (String(input).endsWith('/doors/2/answer')) return new Promise(resolve => { resolveState = resolve })
      throw new Error('Unexpected request')
    })
    const selection = fixture.componentInstance.selectDay(2)
    expect(resolveContent).toBeTypeOf('function')
    expect(resolveState).toBeTypeOf('function')
    resolveContent(new Response('', { status: 404 }))
    resolveState(new Response('', { status: 409 }))
    await selection
    expect(fixture.componentInstance.sessionChanged()).toBe(true)
    expect(fixture.componentInstance.error()).toBe(true)
    expect(fixture.componentInstance.unavailable()).toBe(false)
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
  it('does not focus confirmation after its identity or date context is invalidated', async () => {
    const component = fixture.componentInstance
    await component.openDoor()
    component.choice.set(1)
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'available' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'recorded', replayToken: 'token' })))
    vi.useFakeTimers()
    const focus = vi.fn()
    ;(component as any).recordedStatus = { nativeElement: { focus } }
    await component.confirm()
    ;(component as any).projectionEpoch++
    await vi.runAllTimersAsync()
    expect(focus).not.toHaveBeenCalled()
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
    const fallback = vi.mocked(window.fetch).getMockImplementation()!
    vi.mocked(window.fetch).mockImplementation((input, init) => String(input).endsWith('/doors/10') ? new Promise(() => {}) : fallback(input, init))
    const selection = fixture.componentInstance.selectDay(10)
    await vi.advanceTimersByTimeAsync(20_000)
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
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response('', { status: 503 }))
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
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Ta réponse à ce cadeau sera effacée')
    expect(fixture.componentInstance.answerState()).toBe('recorded')
    await fixture.componentInstance.confirmPersonalReset()
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

  it.each(['2026-12-25'])('shows Christmas and the zero score without requiring participation on %s', async date => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ sessionId: 'fiction', testControls: false })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ date })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ priorityResult: null, ranking: { score: 0, rank: 1, entries: [] } })))
    await fixture.componentInstance.start()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Joyeux Noël')
    expect(fixture.nativeElement.textContent).toContain('0 points')
    expect(fixture.nativeElement.querySelector('.advent__santa')).not.toBeNull()
    expect((fixture.nativeElement.querySelector('[aria-label="Voir le calendrier"]') as HTMLButtonElement).disabled).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('Voir le classement')
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()
    expect(fixture.nativeElement.querySelector('.advent__gift')).toBeNull()
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
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error('offline')).mockRejectedValueOnce(new Error('offline'))
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
  it.each(['2026-12-25'])('opens the final ranking on %s without an answer', async date => {
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
    expect(fixture.nativeElement.querySelector('#ranking-title')?.textContent).toContain('Classement')
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

  it('opens the final ranking directly after Christmas', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ testControls: false, sessionId: 'member-session' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ date: '2027-01-15' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: null })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ranking: { score: 0, rank: 2, entries: [] }, priorityResult: null })))
    await fixture.componentInstance.start()
    fixture.detectChanges()
    expect(fixture.componentInstance.rankingOpen()).toBe(true)
  })

  it('records a dismissal before returning to the originating route', async () => {
    const router = TestBed.inject(Router)
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true)
    sessionStorage.setItem('hatcast-advent-return', '/agenda')
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))
    await fixture.componentInstance.closeExperience()
    expect(vi.mocked(window.fetch).mock.calls.at(-1)?.[0]).toBe('/v1/advent/entry/dismiss')
    expect(vi.mocked(window.fetch).mock.calls.at(-1)?.[1]?.signal).toBeInstanceOf(AbortSignal)
    expect(navigate).toHaveBeenCalledWith('/agenda')
    expect(sessionStorage.getItem('hatcast-advent-return')).toBeNull()
  })

  it('prevents dismissal while an answer mutation is pending', async () => {
    fixture.componentInstance.submitting.set(true)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Fermer le quiz"]').disabled).toBe(true)
    vi.mocked(window.fetch).mockClear()
    await fixture.componentInstance.closeExperience()
    expect(window.fetch).not.toHaveBeenCalled()
  })

  it('keeps the experience open when dismissal fails and offers an explicit exit', async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce(new Response('', { status: 503 }))
    await fixture.componentInstance.closeExperience()
    fixture.detectChanges()
    expect(fixture.componentInstance.closeError()).toBe(true)
    expect(fixture.nativeElement.textContent).toContain('Quitter sans enregistrer')
  })

})
