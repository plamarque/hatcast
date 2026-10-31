import { Component, ElementRef, ViewChild, signal, inject, effect } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatRadioModule } from '@angular/material/radio'
import { RouterLink } from '@angular/router'
import { AuthApiService } from '../../core/auth/auth-api.service'

const REQUEST_TIMEOUT_MS = 10_000

class TransientReadError extends Error {}
class StaleRequestError extends Error {}

interface AdventResult { answerId: string; day: number; selectedChoice: number; falseChoice: number; correct: boolean; responsePoints: number; participationPoints: number; bonusPoints: number; totalPoints: number; seen: boolean; explanation?: string | null; late?: boolean }

interface AdventRanking { score: number; rank: number | null; entries: { name: string; score: number; rank: number; mine: boolean }[] }

interface CalendarDay { day: number; state: 'locked' | 'played' | 'today' | 'past-unplayed' | 'missing' | 'christmas'; outcome?: 'pending' | 'correct' | 'incorrect' | null }
interface History { quiz: FictionalQuiz; falseChoice: number; result: AdventResult | null }

interface FictionalQuiz { day: number; name: string; portrait: string; statements: string[]; genericElf: boolean }

@Component({
  selector: 'app-advent-test',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatRadioModule, RouterLink],
  templateUrl: './advent-test.html',
  styleUrls: ['./advent-test.scss', './advent-result.scss', './advent-ranking.scss', './advent-calendar.scss'],
})
export class AdventTest {
  private readonly auth = inject(AuthApiService)
  private identity = this.auth.sessionUser()?.id ?? null
  private projectionEpoch = 0
  private identityEpoch = 0
  constructor() {
    effect(() => {
      const identity = this.auth.sessionUser()?.id ?? null
      if (identity === this.identity) return
      this.identity = identity
      this.identityEpoch++
      this.personalResetConfirm.set(null)
      this.projectionEpoch++
      this.calendarDays.set([]); this.calendarOpen.set(false)
      this.result.set(null); this.resultContent.set(null); this.history.set(null)
      this.ranking.set(null); this.rankingOpen.set(false); this.christmasScore.set(null)
      this.quiz.set(null); this.preview.set(null); this.clearVisibilityListener()
      this.loading.set(false); this.submitting.set(false); this.closingDay.set(null)
      this.error.set(false); this.rankingError.set(false); this.christmasError.set(false); this.calendarActionMessage.set('')
      this.generation = null; this.replayToken = null; this.sessionId = null; this.recordedLate = false
      this.choice.set(null); this.answerState.set('checking'); this.testControls.set(false); this.testMode.set(false); this.sessionChanged.set(false)
      if (identity) void this.start()
    })
  }
  readonly testControls = signal(false)
  readonly testMode = signal(false)
  readonly pendingMutations = signal(0)
  readonly resetConfirm = signal(false)
  readonly personalResetConfirm = signal<'calendar' | 'replay' | null>(null)
  get memberMode(): boolean { return !this.testMode() }
  async toggleTestMode(): Promise<void> {
    if (!this.testControls() || this.loading() || this.submitting() || this.closingDay() !== null || this.pendingMutations()) return
    const identity = this.auth.sessionUser()?.id ?? null
    const identityEpoch = this.identityEpoch
    const enabled = !this.testMode()
    const previousScreen = this.calendarOpen() ? 'calendar' : this.rankingOpen() ? 'ranking' : null
    this.projectionEpoch++
    this.testMode.set(enabled)
    this.resetConfirm.set(false)
    this.personalResetConfirm.set(null)
    this.simulatedDate.set(enabled ? (this.clockDate() && this.clockDate()! >= '2026-12-01' && this.clockDate()! <= '2027-01-15' ? this.clockDate() : '2026-12-01') : null)
    await this.start()
    if (identityEpoch === this.identityEpoch && identity === (this.auth.sessionUser()?.id ?? null) && !this.error() && !this.unavailable() && !this.result() && !this.transitionRequired()) {
      if (previousScreen === 'calendar') await this.openCalendar()
      if (previousScreen === 'ranking') await this.openRanking()
    }
  }
  private readonly api = '/v1/advent'
  readonly ranking = signal<AdventRanking | null>(null)
  isTied(board: AdventRanking, rank: number): boolean { return board.entries.filter(entry => entry.rank === rank).length > 1 }
  readonly calendarOpen = signal(false)
  readonly calendarDays = signal<CalendarDay[]>([])
  readonly closingDay = signal<number | null>(null)
  readonly calendarActionMessage = signal('')
  readonly christmasError = signal(false)
  readonly history = signal<History | null>(null)
  readonly christmasScore = signal<number | null>(null)
  @ViewChild('calendarHeading') private calendarHeading?: ElementRef<HTMLElement>
  @ViewChild('historyHeading') private historyHeading?: ElementRef<HTMLElement>
  readonly rankingOpen = signal(false)
  readonly rankingError = signal(false)
  @ViewChild('rankingButton', { read: ElementRef }) private rankingButton?: ElementRef<HTMLElement>
  @ViewChild('rankingHeading') private rankingHeading?: ElementRef<HTMLElement>
  readonly historicalResult = signal(false)
  readonly result = signal<AdventResult | null>(null)
  readonly resultContent = signal<FictionalQuiz | null>(null)
  readonly clockDate = signal<string | null>(null)
  private readonly simulatedDate = signal<string | null>(null)
  simulatedDay(): number | null { const date = this.clockDate(); return date ? Number(date.slice(-2)) : null }
  simulatedDateLabel(short = false): string {
    const date = this.clockDate()
    if (!date) return 'Jour simulé non disponible'
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: short ? 'short' : 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
  }
  readonly selectedDay = signal(1)
  readonly preview = signal<FictionalQuiz | null>(null)
  readonly loading = signal(false)
  readonly error = signal(false)
  readonly unavailable = signal(false)
  readonly transitionRequired = signal(false)
  readonly quiz = signal<FictionalQuiz | null>(null)
  readonly choice = signal<number | null>(null)
  readonly answerState = signal<'checking' | 'available' | 'recorded' | 'closed' | 'uncertain'>('checking')
  readonly submitting = signal(false)
  readonly sessionChanged = signal(false)
  private sessionId: string | null = null
  private generation: string | null = null
  private replayToken: string | null = null
  private recordedLate = false
  readonly lateDiscovery = signal(false)
  private visibilityListener: (() => void) | null = null
  @ViewChild('resultHeading') private resultHeading?: ElementRef<HTMLElement>
  @ViewChild('quizHeading') private quizHeading?: ElementRef<HTMLElement>
  @ViewChild('recordedStatus') private recordedStatus?: ElementRef<HTMLElement>

  owner(name: string): string {
    if (name === 'Lutin de Noël') return 'du lutin de Noël'
    return /^[aeiouyàâéèêëîïôùûü]/i.test(name) ? `d’${name}` : `de ${name}`
  }

  ngOnInit(): void { void this.start() }
  ngOnDestroy(): void { this.projectionEpoch++; this.clearVisibilityListener() }
  private clearVisibilityListener(): void {
    if (this.visibilityListener) document.removeEventListener('visibilitychange', this.visibilityListener)
    this.visibilityListener = null
  }

  async start(): Promise<void> {
    this.projectionEpoch++
    this.calendarOpen.set(false); this.calendarDays.set([]); this.history.set(null); this.christmasScore.set(null); this.lateDiscovery.set(false)
    this.rankingOpen.set(false)
    this.ranking.set(null)
    this.rankingError.set(false)
    this.loading.set(true)
    this.error.set(false)
    this.sessionChanged.set(false)
    this.transitionRequired.set(false)
    this.unavailable.set(false)
    this.clearVisibilityListener()
    this.result.set(null); this.resultContent.set(null); this.quiz.set(null); this.preview.set(null)
    this.generation = null; this.replayToken = null; this.choice.set(null)
    this.clockDate.set(null)
    try {
      const session = await this.requestJson<{ testControls: boolean; sessionId: string; transitionRequired?: boolean }>('/v1/advent/session', { credentials: 'include', cache: 'no-store' })
      if (!session.sessionId) throw new Error('Invalid session')
      this.testControls.set(session.testControls === true)
      if (!session.testControls) { this.testMode.set(false); this.simulatedDate.set(null) }
      this.sessionId = session.sessionId
      if (session.transitionRequired) { this.transitionRequired.set(true); this.loading.set(false); return }
      const clock = await this.requestJson<{ date: string } | null>('/v1/advent-test/clock', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
      if (!clock) { this.showUnavailable(); return }
      await this.enterAt(clock.date)
    } catch (error) { if (!(error instanceof StaleRequestError)) { this.error.set(true); this.loading.set(false) } }
  }

  private async showResult(result: AdventResult, historical = false): Promise<void> {
    this.historicalResult.set(historical)
    this.selectedDay.set(result.day)
    const content = await this.requestJson<FictionalQuiz | null>(`/v1/advent-test/doors/${result.day}`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
    if (!content) { this.showUnavailable(); return }
    // Fence the content fetch and bind the replay token to the same answer.
    const state = await this.requestJson<{ status: string; replayToken?: string }>(`/v1/advent-test/doors/${result.day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
    const current = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${result.day}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
    if (state.status === 'unavailable' || !current) { this.showUnavailable(); return }
    if (state.status !== 'recorded' || (!this.memberMode && !state.replayToken) || current.answerId !== result.answerId) throw new Error('Result changed')
    this.clearVisibilityListener()
    this.calendarOpen.set(false); this.history.set(null); this.closeRanking(); this.christmasError.set(false)
    this.selectedDay.set(result.day)
    this.quiz.set(null)
    this.replayToken = state.replayToken ?? null
    this.answerState.set('recorded')
    this.resultContent.set(content)
    this.unavailable.set(false)
    this.result.set(current)
    this.loading.set(false)
    const resultEpoch = this.projectionEpoch
    const resultIdentity = this.auth.sessionUser()?.id ?? null
    const display = () => {
      if (document.visibilityState !== 'visible') return
      this.clearVisibilityListener()
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const heading = this.resultHeading?.nativeElement
        if (!this.contextCurrent(resultEpoch, resultIdentity)) return
        if (document.visibilityState !== 'visible' || !heading?.isConnected || this.result()?.answerId !== result.answerId) {
          if (this.result()?.answerId === result.answerId && document.visibilityState !== 'visible') {
            this.visibilityListener = display
            document.addEventListener('visibilitychange', display)
          }
          return
        }
        heading.focus()
        this.pendingMutations.update(n => n + 1)
        void fetch(`${this.api}/doors/${result.day}/result/acknowledge`, { method: 'POST', credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ answerId: result.answerId }) }).then(response => { if (this.contextCurrent(resultEpoch, resultIdentity) && response.status === 409) { this.sessionChanged.set(true); this.error.set(true) } }).catch(() => {}).finally(() => this.pendingMutations.update(n => n - 1))
      }))
    }
    if (document.visibilityState === 'visible') display()
    else { this.visibilityListener = display; document.addEventListener('visibilitychange', display) }
  }

  /** Re-enter at a simulated date, giving any eligible unseen reveal priority. */
  private async enterAt(date: string): Promise<void> {
    this.projectionEpoch++
    const returnToCalendar = this.calendarOpen()
    this.closeRanking()
    this.calendarOpen.set(false); this.calendarDays.set([]); this.history.set(null); this.christmasScore.set(null); this.lateDiscovery.set(false)
    this.clearVisibilityListener()
    this.result.set(null); this.resultContent.set(null); this.quiz.set(null); this.preview.set(null)
    this.generation = null; this.replayToken = null; this.choice.set(null)
    this.unavailable.set(false)
    this.clockDate.set(date)
    const latest = await this.requestJson<{ result: AdventResult | null }>('/v1/advent-test/results/latest-unseen', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
    if (latest.result) {
      this.preview.set(null)
      await this.showResult(latest.result)
    } else {
      this.clearVisibilityListener()
      this.result.set(null); this.resultContent.set(null); this.quiz.set(null); this.preview.set(null)
      this.replayToken = null
      this.unavailable.set(false)
      this.loading.set(false)
      if (returnToCalendar) await this.openCalendar()
      else if (date < '2026-12-25') await this.selectDay(Math.min(24, Math.max(1, Number(date.slice(-2)))))
      else await this.loadChristmasScore()
    }
  }

  private async loadChristmasScore(): Promise<void> {
    const response = await this.requestJson<{ ranking: AdventRanking | null; priorityResult: AdventResult | null }>('/v1/advent-test/ranking', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
    if (response.priorityResult) { await this.showResult(response.priorityResult); return }
    if (!response.ranking) throw new Error('Ranking unavailable')
    this.christmasScore.set(response.ranking.score)
  }

  selectedDayIsPast(): boolean {
    return (this.clockDate() ?? '') > `2026-12-${String(this.selectedDay()).padStart(2, '0')}`
  }

  isCalendarToday(day: CalendarDay): boolean {
    return this.clockDate() === `2026-12-${String(day.day).padStart(2, '0')}`
  }

  calendarLabel(day: CalendarDay): string {
    if (day.state === 'played') return ({ pending: 'Réponse enregistrée, résultat en attente', correct: 'Bonne réponse', incorrect: 'Mauvaise réponse' })[day.outcome ?? 'pending']
    return ({ locked: 'Verrouillé', played: 'Réponse enregistrée', today: 'Aujourd’hui', 'past-unplayed': 'Cadeau fermé', missing: 'Sans contenu', christmas: 'Résumé de Noël' })[day.state]
  }

  async openCalendar(): Promise<void> {
    this.personalResetConfirm.set(null)
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (this.loading() || this.submitting() || this.result() || this.sessionChanged()) return
    this.loading.set(true); this.error.set(false)
    try {
      const response = await this.requestJson<{ days: CalendarDay[] | null; priorityResult: AdventResult | null }>('/v1/advent-test/calendar', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (response.priorityResult) { this.calendarOpen.set(false); this.history.set(null); await this.showResult(response.priorityResult); return }
      if (!response.days) throw new Error('Calendar unavailable')
      this.calendarDays.set(response.days); this.history.set(null); this.rankingOpen.set(false); this.calendarOpen.set(true)
      setTimeout(() => this.calendarHeading?.nativeElement.focus())
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.error.set(true) }
    finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
  }

  currentPlayedDay(): CalendarDay | undefined {
    const date = this.clockDate()
    if (!date || !/^2026-12-(0[1-9]|1[0-9]|2[0-4])$/.test(date)) return undefined
    return this.calendarDays().find(day => day.state === 'played' && this.isCalendarToday(day))
  }

  async confirmPersonalReset(): Promise<void> {
    const action = this.personalResetConfirm()
    this.personalResetConfirm.set(null)
    if (!this.testMode()) return
    if (action === 'calendar') await this.closeCalendarDay()
    if (action === 'replay') await this.replay()
  }

  async closeCalendarDay(): Promise<void> {
    const day = this.currentPlayedDay()
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (!day || !this.testMode() || !this.calendarOpen() || this.loading() || this.submitting() || this.closingDay() !== null) return
    this.closingDay.set(day.day)
    this.calendarActionMessage.set('')
    try {
      const state = await this.requestJson<{ status: string; replayToken?: string }>(`/v1/advent-test/doors/${day.day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (state.status !== 'recorded' || !state.replayToken) throw new Error('Answer changed')
      const response = await this.requestJson<{ status: string; priorityResult?: AdventResult | null }>(`/v1/advent-test/doors/${day.day}/answer/replay`, {
        method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ replayToken: state.replayToken, close: true }),
      })
      if (response.priorityResult) { this.calendarOpen.set(false); await this.showResult(response.priorityResult); return }
      if (response.status !== 'cleared') throw new Error('Answer changed')
      await this.openCalendar()
      if (this.contextCurrent(epoch, identity) && this.calendarOpen() && !this.error()) this.calendarActionMessage.set(`La case ${day.day} est refermée.`)
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.calendarActionMessage.set('Impossible de refermer cette case. Actualise le calendrier avant de réessayer.')
      await this.openCalendar()
    } finally { if (this.contextCurrent(epoch, identity)) this.closingDay.set(null) }
  }

  async openCalendarDay(day: CalendarDay): Promise<void> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (day.state === 'locked' || this.loading()) return
    if (day.state === 'christmas') {
      this.christmasError.set(false); this.loading.set(true)
      try {
        await this.loadChristmasScore()
        if (!this.result()) { this.calendarOpen.set(false); this.history.set(null); this.quiz.set(null); this.preview.set(null); this.unavailable.set(false) }
      } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
        this.christmasError.set(true) }
      finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
      return
    }
    if (day.state === 'today' || (day.state === 'played' && this.clockDate() === `2026-12-${String(day.day).padStart(2, '0')}`)) {
      this.lateDiscovery.set(false)
      this.calendarOpen.set(false); this.history.set(null); this.unavailable.set(false); await this.selectDay(day.day); return
    }
    if (day.state === 'missing') { this.history.set(null); this.calendarOpen.set(false); this.unavailable.set(true); this.selectedDay.set(day.day); return }
    this.loading.set(true); this.error.set(false)
    try {
      const history = await this.requestJson<History & { priorityResult: AdventResult | null }>(`/v1/advent-test/doors/${day.day}/history`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (history.priorityResult) { this.calendarOpen.set(false); await this.showResult(history.priorityResult); return }
      if (!history.quiz) throw new Error('History unavailable')
      this.calendarOpen.set(false)
      if (history.result) { await this.showResult(history.result, true); return }
      this.lateDiscovery.set(true)
      this.loading.set(false)
      await this.selectDay(day.day)
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.error.set(true) }
    finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
  }

  async returnToCalendar(): Promise<void> {
    this.clearVisibilityListener()
    this.result.set(null); this.resultContent.set(null); this.quiz.set(null); this.preview.set(null)
    this.historicalResult.set(false)
    await this.openCalendar()
  }

  finalRankingAvailable(): boolean {
    const date = this.clockDate()
    return date !== null && date >= '2026-12-25' && date <= '2027-01-15'
  }

  async navigateRanking(): Promise<void> {
    if (this.historicalResult()) {
      this.clearVisibilityListener()
      this.result.set(null); this.resultContent.set(null); this.quiz.set(null); this.preview.set(null)
      this.historicalResult.set(false)
      this.calendarOpen.set(true)
    }
    await this.openRanking()
  }

  async openRanking(): Promise<void> {
    this.personalResetConfirm.set(null)
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (this.loading() || this.submitting() || this.result() || this.sessionChanged() || this.rankingOpen()) return
    this.loading.set(true)
    this.error.set(false)
    this.rankingError.set(false)
    try {
      const response = await this.requestJson<{ ranking: AdventRanking | null; priorityResult: AdventResult | null }>('/v1/advent-test/ranking', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (response.priorityResult) { await this.showResult(response.priorityResult); return }
      if (!response.ranking) throw new Error('Ranking unavailable')
      this.ranking.set(response.ranking)
      this.calendarOpen.set(false); this.history.set(null)
      this.rankingOpen.set(true)
      setTimeout(() => this.rankingHeading?.nativeElement.focus())
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.rankingError.set(true) }
    finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
  }

  closeRanking(restoreFocus = false): void {
    this.rankingOpen.set(false)
    this.ranking.set(null)
    if (restoreFocus) setTimeout(() => this.rankingButton?.nativeElement.focus())
  }

  async resetGame(): Promise<void> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (!this.testMode() || !this.resetConfirm() || this.loading() || this.submitting()) return
    this.loading.set(true)
    this.error.set(false)
    try {
      const response = await fetch(`${this.api}/session/reset`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders() } })
      if (!this.contextCurrent(epoch, identity)) throw new StaleRequestError()
      if (!response.ok) throw new Error('Reset failed')
      this.resetConfirm.set(false)
      await this.start()
    } catch (error) { if (!(error instanceof StaleRequestError) && this.contextCurrent(epoch, identity)) { this.error.set(true); this.loading.set(false) } }
  }

  private shiftedDate(days: number): string | null {
    const current = this.clockDate()
    if (!current) return null
    const date = new Date(`${current}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + days)
    const target = date.toISOString().slice(0, 10)
    return target >= '2026-12-01' && target <= '2027-01-15' ? target : null
  }

  async advanceClock(): Promise<void> {
    const target = this.shiftedDate(1)
    if (!this.testMode() || !target || this.loading() || this.submitting() || this.closingDay() !== null) return
    this.loading.set(true)
    this.error.set(false)
    this.simulatedDate.set(target)
    try { await this.enterAt(target) }
    catch (error) { if (!(error instanceof StaleRequestError)) { this.error.set(true); this.loading.set(false) } }
  }

  async continueAfterResult(): Promise<void> {
    if (this.loading()) return
    this.loading.set(true)
    this.error.set(false)
    try {
      // Refresh the server reference using this tab’s simulation context.
      const clock = await this.requestJson<{ date: string }>('/v1/advent-test/clock', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      this.clockDate.set(clock.date)
      this.quiz.set(null)
      this.preview.set(null)
      this.clearVisibilityListener()
      this.result.set(null)
      this.resultContent.set(null)
      this.replayToken = null
      this.unavailable.set(false)
      this.loading.set(false)
      if (clock.date >= '2026-12-25') { await this.loadChristmasScore(); return }
      await this.selectDay(Math.min(24, Math.max(1, Number(clock.date.slice(-2)))))
    } catch (error) {
      if (error instanceof StaleRequestError) return
      this.error.set(true)
      this.loading.set(false)
    }
  }

  private showUnavailable(): void {
    this.clearVisibilityListener()
    this.result.set(null); this.resultContent.set(null); this.quiz.set(null); this.preview.set(null)
    this.generation = null; this.replayToken = null; this.choice.set(null)
    this.unavailable.set(true); this.error.set(false); this.loading.set(false)
  }

  async selectDay(day: number): Promise<void> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (this.loading() || this.submitting() || (this.quiz() && this.answerState() === 'checking')) return
    this.selectedDay.set(day)
    this.unavailable.set(false)
    this.quiz.set(null)
    this.choice.set(null)
    this.answerState.set('checking')
    this.preview.set(null)
    this.loading.set(true)
    this.error.set(false)
    this.sessionChanged.set(false)
    try {
      const [content, state] = await Promise.all([
        this.requestJson<FictionalQuiz | null>(`/v1/advent-test/doors/${day}`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true),
        this.requestJson<{ status: 'available' | 'recorded' | 'closed' | 'unavailable'; replayToken?: string }>(`/v1/advent-test/doors/${day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }),
      ])
      if (!content) { this.showUnavailable(); return }
      if (state.status === 'unavailable') { this.showUnavailable(); return }
      if (!['available', 'recorded', 'closed'].includes(state.status)) throw new Error('Invalid state')
      if (!this.memberMode && state.status === 'recorded' && !state.replayToken) throw new Error('Invalid state')
      this.preview.set(content)
      if (state.status === 'recorded') {
        const result = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${day}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
        if (result) {
          await this.showResult(result)
          return
        }
        this.replayToken = state.replayToken ?? null
        this.answerState.set('recorded')
        this.quiz.set(content)
      }
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.preview.set(null)
      this.error.set(true)
    } finally {
      if (this.contextCurrent(epoch, identity)) this.loading.set(false)
    }
  }

  async retryEntry(): Promise<void> {
    const target = this.simulatedDate()
    if (!target || this.sessionChanged()) { await this.start(); return }
    if (this.loading() || this.submitting()) return
    this.loading.set(true)
    this.error.set(false)
    try { await this.enterAt(target) }
    catch (error) { if (!(error instanceof StaleRequestError)) { this.error.set(true); this.loading.set(false) } }
  }

  async previousDay(): Promise<void> {
    const target = this.shiftedDate(-1)
    if (!this.testMode() || !target || this.loading() || this.submitting() || this.closingDay() !== null || (this.quiz() && this.answerState() === 'checking')) return
    this.loading.set(true)
    this.error.set(false)
    this.simulatedDate.set(target)
    try { await this.enterAt(target) }
    catch (error) { if (!(error instanceof StaleRequestError)) { this.error.set(true); this.loading.set(false) } }
  }

  async nextDay(): Promise<void> {
    if ((this.clockDate() ?? '') >= '2027-01-15') return
    await this.advanceClock()
  }

  async openDoor(): Promise<void> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (this.loading() || this.submitting() || (this.quiz() && this.answerState() === 'checking')) return
    if (!this.preview()) await this.selectDay(this.selectedDay())
    if (!this.contextCurrent(epoch, identity)) return
    const content = this.preview()
    if (content) {
      this.quiz.set(content)
      await this.reconcile()
      if (this.contextCurrent(epoch, identity)) setTimeout(() => { if (this.contextCurrent(epoch, identity)) (this.answerState() === 'recorded' ? this.recordedStatus : this.quizHeading)?.nativeElement.focus() })
    }
  }
  async reconcile(): Promise<void> {
    this.answerState.set('checking')
    try {
      const data = await this.requestJson<{ status: 'available' | 'recorded' | 'closed' | 'unavailable'; generation?: string; replayToken?: string; late?: boolean }>(`/v1/advent-test/doors/${this.selectedDay()}/answer/reconcile`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ late: this.lateDiscovery() }) })
      if (data.status === 'unavailable') { this.showUnavailable(); return }
      if (!['available', 'recorded', 'closed'].includes(data.status)) throw new Error('Invalid state')
      if (data.status === 'available' && !data.generation) throw new Error('Invalid state')
      if (!this.memberMode && data.status === 'recorded' && !data.replayToken) throw new Error('Invalid state')
      this.generation = data.generation ?? null
      this.replayToken = data.replayToken ?? null
      this.answerState.set(data.status)
      this.recordedLate = data.late === true
      if (data.status === 'recorded' && this.recordedLate && !this.submitting()) await this.showLateResult()
    } catch (error) { if (!(error instanceof StaleRequestError)) { this.generation = null; this.answerState.set('uncertain') } }
  }

  async replay(): Promise<void> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (this.submitting() || this.answerState() !== 'recorded' || !this.replayToken) return
    this.submitting.set(true)
    this.choice.set(null)
    const reveal = this.result()
    const historical = this.history()
    try {
      const result = await this.requestJson<{ status: string; replayToken?: string }>(`/v1/advent-test/doors/${this.selectedDay()}/answer/replay`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ replayToken: this.replayToken }) })
      if (result.status === 'unavailable') { this.showUnavailable(); return }
      if (result.status === 'recorded' && !result.replayToken) throw new Error('Invalid state')
      if (!['available', 'recorded', 'closed'].includes(result.status)) throw new Error('Invalid state')
      if (reveal || historical) {
        if (result.status !== 'available') throw new Error('Result changed')
        this.clearVisibilityListener()
        this.lateDiscovery.set(reveal?.late === true)
        this.quiz.set(historical?.quiz ?? this.resultContent())
        this.history.set(null)
        this.result.set(null)
        this.resultContent.set(null)
      }
      await this.reconcile()
      if (this.contextCurrent(epoch, identity)) setTimeout(() => { if (this.contextCurrent(epoch, identity)) (this.answerState() === 'recorded' ? this.recordedStatus : this.quizHeading)?.nativeElement.focus() })
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.generation = null; if (reveal || historical) this.error.set(true); else this.answerState.set('uncertain') }
    finally { if (this.contextCurrent(epoch, identity)) this.submitting.set(false) }
  }

  async confirm(): Promise<void> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    const choice = this.choice()
    if (choice === null || this.submitting() || this.answerState() !== 'available' || !this.generation) return
    this.submitting.set(true)
    try {
      const attemptId = crypto.randomUUID()
      const url = `/v1/advent-test/doors/${this.selectedDay()}/answer`
      const headers = { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }
      const reserved = await this.requestJson<{ status: 'available' | 'recorded' | 'closed' | 'unavailable'; replayToken?: string; late?: boolean }>(`${url}/reserve`, {
        method: 'POST', credentials: 'include', cache: 'no-store', headers, body: JSON.stringify({ attemptId, generation: this.generation }),
      })
      if (reserved.status === 'unavailable') { this.showUnavailable(); return }
      if (reserved.status === 'recorded') { if (!this.memberMode && !reserved.replayToken) throw new Error('Invalid state'); this.replayToken = reserved.replayToken ?? null; this.recordedLate = reserved.late === true; this.answerState.set('recorded'); return }
      if (reserved.status === 'closed') { this.answerState.set('closed'); return }
      if (reserved.status !== 'available') throw new Error('Uncertain')
      const data = await this.requestJson<{ status: 'recorded' | 'closed' | 'unavailable'; replayToken?: string; late?: boolean }>(url, {
        method: 'POST', credentials: 'include', cache: 'no-store', headers, body: JSON.stringify({ choice, attemptId }),
      })
      if (data.status === 'unavailable') { this.showUnavailable(); return }
      if (data.status !== 'recorded' && data.status !== 'closed') throw new Error('Uncertain')
      if (!this.memberMode && data.status === 'recorded' && !data.replayToken) throw new Error('Invalid state')
      this.replayToken = data.replayToken ?? null
      this.recordedLate = data.late === true
      this.answerState.set(data.status)
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      if (this.sessionChanged()) this.answerState.set('uncertain')
      else await this.reconcile()
    }
    finally {
      if (!this.contextCurrent(epoch, identity)) return
      this.submitting.set(false)
      if (this.answerState() === 'recorded' && this.recordedLate) {
        try { await this.showLateResult(); return } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
          this.answerState.set('uncertain'); return }
      }
      if (this.answerState() === 'recorded') setTimeout(() => { if (this.contextCurrent(epoch, identity)) this.recordedStatus?.nativeElement.focus() })
    }
  }

  private async showLateResult(): Promise<void> {
    const result = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${this.selectedDay()}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
    if (!result || !result.late) throw new Error('Late result unavailable')
    await this.showResult(result, true)
  }

  private contextCurrent(epoch: number, identity: string | null): boolean {
    return epoch === this.projectionEpoch && identity === (this.auth.sessionUser()?.id ?? null)
  }

  private async requestJson<T>(url: string, options: RequestInit, notFoundAsNull = false): Promise<T> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    const mutation = (options.method ?? 'GET').toUpperCase() !== 'GET'
    if (mutation) this.pendingMutations.update(n => n + 1)
    try {
      return await this.requestJsonOnce<T>(url, options, notFoundAsNull)
    } catch (error) {
      if (!this.contextCurrent(epoch, identity)) throw new StaleRequestError()
      if ((options.method ?? 'GET').toUpperCase() !== 'GET' || !(error instanceof TransientReadError)) throw error
      return await this.requestJsonOnce<T>(url, options, notFoundAsNull)
    } finally { if (mutation) this.pendingMutations.update(n => n - 1) }
  }

  private async requestJsonOnce<T>(url: string, options: RequestInit, notFoundAsNull: boolean): Promise<T> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new TransientReadError('Timeout')) }, REQUEST_TIMEOUT_MS)
    })
    try {
      return await Promise.race([
        (async () => {
          const response = await fetch(url.replace('/v1/advent-test', this.api), { ...options, signal: controller.signal }).catch(() => { throw new TransientReadError('Network failure') })
          if (epoch !== this.projectionEpoch || identity !== (this.auth.sessionUser()?.id ?? null)) throw new StaleRequestError()
          if (response.status === 409) {
            this.sessionChanged.set(true)
            this.generation = null
            this.replayToken = null
          }
          if (response.status === 404 && notFoundAsNull) return null as T
          if (response.status >= 500) throw new TransientReadError('Server unavailable')
          if (!response.ok) throw new Error('Unavailable')
          try {
            const data = await response.json() as T
            if (epoch !== this.projectionEpoch || identity !== (this.auth.sessionUser()?.id ?? null)) throw new StaleRequestError()
            return data
          }
          catch (error) { if (error instanceof TypeError) throw new TransientReadError('Response interrupted'); throw error }
        })(),
        timeout,
      ])
    } catch (error) {
      if (!this.contextCurrent(epoch, identity)) throw new StaleRequestError()
      throw error
    } finally { clearTimeout(timer) }
  }

  private sessionHeaders(): Record<string, string> {
    return {
      ...(this.sessionId ? { 'X-Advent-Test-Session': this.sessionId } : {}),
      ...(this.testMode() ? { 'X-Advent-Test-Mode': 'true' } : {}),
      ...(this.testMode() && this.simulatedDate() ? { 'X-Advent-Simulated-Date': this.simulatedDate()! } : {}),
    }
  }

  private csrfHeaders(): Record<string, string> {
    const token = document.cookie.split('; ').find(item => item.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
    return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}
  }

}
