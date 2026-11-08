import { MatExpansionModule } from '@angular/material/expansion';
import { Component, ElementRef, ViewChild, signal, inject, effect } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { NavigationEnd, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { PushNotificationsService } from '../../core/push/push-notifications.service'

const REQUEST_TIMEOUT_MS = 10_000

class TransientReadError extends Error {}
class StaleRequestError extends Error {}

interface AdventResult { answerId: string; day: number; selectedChoice: number; falseChoice: number; correct: boolean; responsePoints: number; participationPoints: number; bonusPoints: number; totalPoints: number; seen: boolean; explanation?: string | null; late?: boolean; stories?: (string | null)[] | null }

interface ClockProjection { date: string; effectiveInstant: string; nextMidnight: string; simulated: boolean }

type ChristmasFixture = 'sole' | 'shared' | 'participant' | 'participant-tied' | 'zero'
interface AdventRanking { score: number; rank: number | null; entries: { name: string; score: number; rank: number; mine: boolean; tieReason?: 'CORRECT' | 'ANSWERS' | 'STREAK' | 'ATTAINMENT' | 'NAME' | 'ID' | null }[] }

interface CalendarDay { day: number; state: 'locked' | 'played' | 'today' | 'past-unplayed' | 'missing' | 'christmas'; outcome?: 'pending' | 'correct' | 'incorrect' | null }
interface History { quiz: FictionalQuiz; falseChoice: number; result: AdventResult | null }

interface FictionalQuiz { day: number; name: string; portrait: string; statements: string[]; genericElf: boolean; stories?: (string | null)[] | null }

@Component({
  selector: 'app-advent-test',
  standalone: true,
  imports: [MatExpansionModule, MatButtonModule, MatIconModule, MatMenuModule, MatRadioModule, NgTemplateOutlet],
  templateUrl: './advent-test.html',
  styleUrls: ['./advent-christmas.scss', './advent-test.scss', './advent-waiting.scss', './advent-result.scss', './advent-ranking.scss', './advent-calendar.scss', './advent-illustrated.scss', './advent-welcome.scss', './advent-controls.scss', './advent-reminder.scss'],
})
export class AdventTest {
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly push = inject(PushNotificationsService)
  readonly reminderEnabled = signal<boolean | null>(null)
  readonly previewReminderEnabled = signal(false)
  readonly reminderDeviceOwned = signal(false)
  readonly reminderBusy = signal(false)
  private readonly reminderLoadFailed = signal(false)
  readonly reminderMessage = signal('')
  private reminderEpoch = 0

  private async reminderRequest(path: string, method = 'GET', body?: unknown): Promise<any> {
    const response = await fetch(`${this.api}/${path}`, { method, credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { ...this.sessionHeaders(), 'X-Advent-User': this.identity ?? '', ...(method === 'GET' ? {} : { ...this.csrfHeaders(), 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
    if (!response.ok) throw new Error('Reminder request failed')
    return response.status === 204 || path === 'reminder-device' || path === 'test-reminder-device' ? null : response.json()
  }

  readonly testReminderMessage = signal('')
  readonly testReminderBusy = signal(false)
  private notificationParametersConsumed = false

  async sendTestReminder(): Promise<void> {
    const date = this.simulatedDate()
    if (!this.testMode() || !this.testControls() || this.testReminderBusy() || !date || !/^2026-12-(0[1-9]|1[0-9]|2[0-4])$/.test(date)) {
      this.testReminderMessage.set('Choisis un jour du 1er au 24 décembre pour tester le rappel.')
      return
    }
    const identity = this.identityEpoch
    const context = this.projectionEpoch
    this.testReminderBusy.set(true); this.testReminderMessage.set('')
    try {
      let subscription: PushSubscriptionJSON | null = null
      const device = await this.push.activateAdventDevice(async value => {
        if (identity !== this.identityEpoch || context !== this.projectionEpoch || !this.testMode()) return false
        await this.reminderRequest('test-reminder-device', 'PUT', value)
        subscription = value
        return identity === this.identityEpoch && context === this.projectionEpoch && this.testMode()
      })
      if (identity !== this.identityEpoch || context !== this.projectionEpoch || !this.testMode()) return
      if (!device.endpoint || !subscription) { this.testReminderMessage.set(device.message ?? 'Active les notifications sur cet appareil.'); return }
      await this.reminderRequest('test-reminder', 'POST', subscription)
      if (identity === this.identityEpoch && context === this.projectionEpoch) this.testReminderMessage.set('Envoi accepté. Vérifie la réception sur cet appareil.')
    } catch { if (identity === this.identityEpoch && context === this.projectionEpoch) this.testReminderMessage.set('Envoi non confirmé. Vérifie ton appareil avant de réessayer.') }
    finally { this.testReminderBusy.set(false) }
  }

  async loadReminder(): Promise<void> {
    if (this.testMode()) return
    const identity = this.identityEpoch
    const revision = ++this.reminderEpoch
    try {
      const preference = await this.reminderRequest('reminder-preference')
      if (identity !== this.identityEpoch || revision !== this.reminderEpoch || this.testMode()) return
      const endpoint = await this.push.adventDeviceEndpoint()
      const device = endpoint ? await this.reminderRequest('reminder-device/status', 'POST', { endpoint }) : { owned: false }
      if (identity !== this.identityEpoch || revision !== this.reminderEpoch || this.testMode()) return
      this.reminderEnabled.set(preference.enabled)
      this.reminderDeviceOwned.set(device.owned)
    } catch { if (identity === this.identityEpoch && revision === this.reminderEpoch) this.reminderLoadFailed.set(true) }
  }

  async changeReminder(enabled: boolean, deviceOnly = false): Promise<void> {
    if (this.reminderBusy() || this.testMode()) return
    this.reminderEpoch++
    const identity = this.identityEpoch
    this.reminderBusy.set(true); this.reminderMessage.set('')
    try {
      let endpoint: string | undefined
      if (enabled) {
        const device = await this.push.activateAdventDevice(async subscription => {
          if (identity !== this.identityEpoch) return false
          await this.reminderRequest('reminder-device', 'PUT', subscription)
          return identity === this.identityEpoch
        })
        if (identity !== this.identityEpoch) return
        if (!device.endpoint) { this.reminderMessage.set(device.message ?? 'Réessaie plus tard.'); return }
        endpoint = device.endpoint
        this.reminderDeviceOwned.set(true)
      }
      if (!deviceOnly) {
        const preference = await this.reminderRequest('reminder-preference', 'PUT', { enabled, endpoint })
        if (identity !== this.identityEpoch) return
        this.reminderEnabled.set(preference.enabled)
      }
    } catch { if (identity === this.identityEpoch) this.reminderMessage.set('Impossible de modifier les rappels. Réessaie.') }
    finally { if (identity === this.identityEpoch) this.reminderBusy.set(false) }
  }

  async onReminderChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    if (this.testMode()) { this.previewReminderEnabled.set(input.checked); return }
    const desired = input.checked
    input.checked = this.reminderEnabled() === true
    await this.changeReminder(desired)
    input.checked = this.reminderEnabled() === true
  }
  readonly openingReplayDate = signal<string | null>(null)
  readonly openingReplayError = signal('')
  readonly openingReplayBusy = signal(false)
  readonly openingReplayOutcome = signal<'confirm' | 'uncertain' | 'logout-failed'>('confirm')
  private openingReplayUncertain = false
  @ViewChild('openingReplayCancel') private openingReplayCancel?: ElementRef<HTMLElement>
  @ViewChild('openingReplayButton', { read: ElementRef }) private openingReplayButton?: ElementRef<HTMLElement>
  @ViewChild('previewReplayButton', { read: ElementRef }) private previewReplayButton?: ElementRef<HTMLElement>
  @ViewChild('personalResetHeading') private personalResetHeading?: ElementRef<HTMLElement>

  async prepareOpeningReplay(): Promise<void> {
    if (!this.testMode() || this.openingReplayBusy() || this.pendingMutations() > 0) return
    const identity = this.auth.sessionUser()?.id
    if (!identity) return
    this.openingReplayBusy.set(true); this.openingReplayError.set(''); this.openingReplayDate.set(null); this.openingReplayOutcome.set('confirm'); this.openingReplayUncertain = false
    try {
      const response = await fetch(`${this.api}/entry/replay`, { credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { ...this.sessionHeaders(), 'X-Advent-User': identity } })
      if (!response.ok || identity !== this.auth.sessionUser()?.id) throw new Error('Preparation failed')
      const preparation = await response.json() as { date: string; eligible: boolean; reason?: string }
      if (identity !== this.auth.sessionUser()?.id) throw new Error('Session changed')
      if (!preparation.eligible) {
        this.openingReplayError.set(preparation.reason === 'missing-quiz' ? 'Aucun quiz n’est disponible pour la date ordinaire de développement.' : 'La date ordinaire de développement est hors de la période des quiz.')
        return
      }
      this.openingReplayDate.set(preparation.date)
      setTimeout(() => this.openingReplayCancel?.nativeElement?.focus())
    } catch { this.openingReplayError.set('Impossible de préparer le rejeu. Vérifie ta session et réessaie.') }
    finally { this.openingReplayBusy.set(false) }
  }

  cancelOpeningReplay(): void {
    this.openingReplayDate.set(null)
    setTimeout(() => this.openingReplayButton?.nativeElement?.focus())
  }

  async confirmOpeningReplay(): Promise<void> {
    const date = this.openingReplayDate()
    const identity = this.auth.sessionUser()?.id
    if (!date || !identity || !this.testMode() || this.openingReplayOutcome() !== 'confirm' || this.openingReplayBusy() || this.pendingMutations() > 0) return
    this.openingReplayBusy.set(true); this.openingReplayError.set('')
    try {
      const response = await fetch(`${this.api}/entry/replay`, { method: 'POST', credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'X-Advent-User': identity, 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) })
      if (!response.ok || identity !== this.auth.sessionUser()?.id) throw new Error('Replay outcome uncertain')
      await this.signOutAfterReplay()
    } catch {
      this.openingReplayUncertain = true
      this.openingReplayOutcome.set('uncertain')
      this.openingReplayError.set('Impossible de confirmer si ta réponse a été effacée. Ne relance pas cette suppression ; déconnecte-toi puis vérifie à la connexion.')
    } finally { this.openingReplayBusy.set(false) }
  }

  private async signOutAfterReplay(): Promise<void> {
    let loggedOut = false
    try { loggedOut = await this.auth.logout() } catch { /* retry is available below */ }
    if (loggedOut) {
      await this.router.navigateByUrl('/connexion')
    } else {
      this.openingReplayOutcome.set('logout-failed')
      this.openingReplayError.set(this.openingReplayUncertain ? 'Le résultat de la suppression reste incertain et la déconnexion a échoué. Réessaie la déconnexion.' : 'La préparation est terminée, mais la déconnexion a échoué. Réessaie la déconnexion avant de te reconnecter.')
    }
  }

  async retryOpeningReplayLogout(): Promise<void> {
    if (this.openingReplayBusy() || this.openingReplayOutcome() !== 'logout-failed') return
    this.openingReplayBusy.set(true)
    try { await this.signOutAfterReplay() }
    catch { this.openingReplayError.set('La déconnexion a échoué. Réessaie la déconnexion avant de te reconnecter.') }
    finally { this.openingReplayBusy.set(false) }
  }

  async leaveUncertainReplay(): Promise<void> {
    if (this.openingReplayBusy() || this.openingReplayOutcome() !== 'uncertain') return
    this.openingReplayBusy.set(true)
    try {
      const ok = await this.auth.logout()
      if (ok) await this.router.navigateByUrl('/connexion')
      else { this.openingReplayOutcome.set('logout-failed'); this.openingReplayError.set('Le résultat de la suppression reste incertain et la déconnexion a échoué. Réessaie la déconnexion.') }
    } catch { this.openingReplayOutcome.set('logout-failed'); this.openingReplayError.set('Le résultat de la suppression reste incertain et la déconnexion a échoué. Réessaie la déconnexion.') }
    finally { this.openingReplayBusy.set(false) }
  }

  readonly closeError = signal(false)
  readonly closingExperience = signal(false)

  async closeExperience(): Promise<void> {
    if (this.openingReplayBusy() || this.openingReplayDate() || this.closingExperience() || this.loading() || this.submitting() || this.pendingMutations() > 0 || this.closingDay() !== null) return
    const identity = this.auth.sessionUser()?.id ?? null
    this.closingExperience.set(true)
    this.closeError.set(false)
    try {
      const response = await fetch(`${this.api}/entry/dismiss`, { method: 'POST', credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { ...this.csrfHeaders(), ...this.sessionHeaders() } })
      if (!response.ok || identity !== (this.auth.sessionUser()?.id ?? null)) throw new Error('Dismissal failed')
      await this.leaveExperience()
    } catch { this.closeError.set(true) }
    finally { this.closingExperience.set(false) }
  }

  async leaveExperience(): Promise<void> {
      const target = sessionStorage.getItem('hatcast-advent-return') || '/accueil'
      sessionStorage.removeItem('hatcast-advent-return')
      await this.router.navigateByUrl(target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/avent') ? target : '/accueil')
  }
  private requestedDay: number | null = this.dayFromUrl()
  private dayQueryKey = this.dayKeyFromUrl()
  private navigationSubscription?: Subscription
  private dayKeyFromUrl(): string {
    return JSON.stringify(this.router.parseUrl(this.router.url).queryParamMap.getAll('jour'))
  }
  private dayFromUrl(): number | null {
    const values = this.router.parseUrl(this.router.url).queryParamMap.getAll('jour')
    if (values.length !== 1 || !/^(?:[1-9]|1[0-9]|2[0-4])$/.test(values[0])) return null
    return Number(values[0])
  }
  private identity = this.auth.sessionUser()?.id ?? null
  private projectionEpoch = 0
  private identityEpoch = 0
  constructor() {
    effect(() => {
      const relevant = !!this.result() || !!this.history()?.result || (!!this.quiz() && this.answerState() === 'recorded')
      if (relevant && this.memberMode && this.reminderEnabled() === null && !this.reminderBusy() && !this.reminderLoadFailed()) {
        void this.loadReminder()
      }
    })
    effect(() => {
      const identity = this.auth.sessionUser()?.id ?? null
      if (identity === this.identity) return
      this.identity = identity
      this.requestedDay = this.dayFromUrl()
      this.reminderLoadFailed.set(false); this.previewReminderEnabled.set(false); this.reminderEnabled.set(null); this.reminderDeviceOwned.set(false); this.reminderBusy.set(false); this.reminderMessage.set('')
      this.discoveryAttempt = null
      this.identityEpoch++
      this.personalResetConfirm.set(null)
      this.replayReloading.set(false); this.replayReloadFailed.set(false)
      this.projectionEpoch++
      this.calendarDays.set([]); this.calendarOpen.set(false); this.welcome.set(false); this.discoveryError.set(false)
      this.result.set(null); this.resultContent.set(null); this.history.set(null)
      this.christmasFixture.set(null)
      this.ranking.set(null); this.fictionalRanking.set(null); this.lastFictionalRanking = null; this.rankingOpen.set(false); this.christmasBoard.set(null); this.christmasScore.set(null); this.christmasPlace.set(null); this.christmasVictory.set(null); this.christmasPreviewOpen.set(false)
      this.quiz.set(null); this.preview.set(null); this.clearVisibilityListener(); this.stopWaiting()
      this.loading.set(false); this.submitting.set(false); this.closingDay.set(null)
      this.error.set(false); this.rankingError.set(false); this.christmasError.set(false); this.calendarActionMessage.set('')
      this.generation = null; this.replayToken = null; this.sessionId = null; this.recordedLate = false
      this.choice.set(null); this.answerState.set('checking'); this.testControls.set(false); this.testMode.set(false); this.productionPreview.set(false); this.sessionChanged.set(false)
      if (identity) void this.start()
    })
  }
  readonly welcome = signal(false)
  readonly welcomePreview = signal(false)
  readonly confirmationPreview = signal(false)
  readonly discoveryError = signal(false)
  private discoveryAttempt: string | null = null
  @ViewChild("welcomeHeading") private welcomeHeading?: ElementRef<HTMLElement>
  @ViewChild("christmasHeading") private christmasHeading?: ElementRef<HTMLElement>
  readonly testControls = signal(false)
  readonly testMode = signal(false)
  readonly productionPreview = signal(false)
  readonly pendingMutations = signal(0)
  readonly resetConfirm = signal(false)
  readonly personalResetConfirm = signal<'calendar' | 'replay' | null>(null)
  readonly replayReloadFailed = signal(false)
  readonly replayReloading = signal(false)
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
    await this.start(enabled)
    if (identityEpoch === this.identityEpoch && identity === (this.auth.sessionUser()?.id ?? null) && !this.error() && !this.unavailable() && !this.result() && !this.transitionRequired() && !this.welcome()) {
      if (!enabled && previousScreen === 'calendar') await this.openCalendar()
      if (!enabled && previousScreen === 'ranking') await this.openRanking()
    }
  }
  private readonly api = '/v1/advent'
  readonly ranking = signal<AdventRanking | null>(null)
  readonly fictionalRanking = signal<AdventRanking | null>(null)
  private lastFictionalRanking: AdventRanking | null = null
  generateFictionalRanking(): void {
    const board = this.ranking()
    if (!board || !this.rankingOpen() || !this.testControls() || !this.testMode() || this.productionPreview() || this.sessionChanged()) return
    // Each total is attainable by answering correctly on that many days.
    const randomScore = (): number => {
      const days = Math.floor(Math.random() * 25)
      return 11 * days + 2 * Math.floor(days / 3)
    }
    const scores = board.entries.map(() => randomScore())
    if (scores.length > 1) {
      const first = Math.floor(Math.random() * scores.length)
      let second = Math.floor(Math.random() * (scores.length - 1))
      if (second >= first) second++
      scores[second] = scores[first]
    }
    let personalScore = randomScore()
    const previous = this.lastFictionalRanking
    // Even a repeated random draw must visibly change the distribution.
    const signature = (entries: AdventRanking['entries']): string =>
      JSON.stringify(entries.map(entry => [entry.name, entry.mine, entry.score]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))))
    if (previous && signature(previous.entries) === signature(board.entries.map((entry, index) => ({ ...entry, score: scores[index] }))) &&
      (board.entries.some(entry => entry.mine) || previous.score === personalScore)) {
      const replacement = (scores[0] ?? personalScore) === 0 ? 1 : 0
      scores.fill(replacement)
      personalScore = replacement
    }
    const entries = board.entries.map((entry, index) => ({ ...entry, score: scores[index] }))
      .sort((a, b) => b.score - a.score)
    for (let i = 0; i < entries.length; i++) {
      let last = i
      while (last + 1 < entries.length && entries[last + 1].score === entries[i].score) last++
      for (let j = i; j <= last; j++) entries[j].rank = last + 1
      i = last
    }
    const mine = entries.find(entry => entry.mine)
    this.lastFictionalRanking = { entries, score: mine?.score ?? personalScore, rank: mine?.rank ?? null }
    this.fictionalRanking.set(this.lastFictionalRanking)
  }
  restoreCalculatedRanking(): void { this.fictionalRanking.set(null); setTimeout(() => this.openingReplayButton?.nativeElement.focus()) }
  isTied(board: AdventRanking, rank: number): boolean { return board.entries.filter(entry => entry.rank === rank).length > 1 }
  readonly calendarOpen = signal(false)
  readonly calendarDays = signal<CalendarDay[]>([])
  readonly closingDay = signal<number | null>(null)
  readonly calendarActionMessage = signal('')
  readonly christmasError = signal(false)
  readonly history = signal<History | null>(null)
  readonly christmasFixture = signal<ChristmasFixture | null>(null)
  readonly christmasPlace = signal<{ rank: number; tied: boolean } | null>(null)
  readonly christmasBoard = signal<AdventRanking | null>(null)
  readonly christmasScore = signal<number | null>(null)
  readonly christmasVictory = signal<'sole' | 'shared' | null>(null)
  readonly christmasPreviewOpen = signal(false)
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
  readonly waiting = signal(false)
  readonly waitingError = signal(false)
  readonly remainingSeconds = signal<number | null>(null)
  private waitingGeneration = 0
  private waitingTimer: ReturnType<typeof setInterval> | null = null
  private waitingVisibility: (() => void) | null = null
  private waitingRefreshInFlight = false
  private waitingRefreshPending = false

  private stopWaiting(): void {
    this.waitingGeneration++
    this.waiting.set(false); this.waitingError.set(false); this.remainingSeconds.set(null)
    if (this.waitingTimer !== null) clearInterval(this.waitingTimer)
    this.waitingTimer = null
    if (this.waitingVisibility) document.removeEventListener('visibilitychange', this.waitingVisibility)
    this.waitingVisibility = null
    this.waitingRefreshInFlight = false
    this.waitingRefreshPending = false
  }

  private async beginWaiting(): Promise<void> {
    this.stopWaiting()
    this.waiting.set(true)
    const generation = this.waitingGeneration
    this.waitingVisibility = () => { if (document.visibilityState === 'visible') void this.refreshWaiting(generation) }
    document.addEventListener('visibilitychange', this.waitingVisibility)
    await this.refreshWaiting(generation)
  }

  async retryWaiting(): Promise<void> { await this.refreshWaiting(this.waitingGeneration) }

  private async refreshWaiting(generation: number): Promise<void> {
    if (!this.waiting() || generation !== this.waitingGeneration) return
    if (this.waitingRefreshInFlight) { this.waitingRefreshPending = true; return }
    this.waitingRefreshInFlight = true
    if (this.waitingTimer !== null) clearInterval(this.waitingTimer)
    this.waitingTimer = null
    try {
      const clock = await this.requestJson<ClockProjection>('/v1/advent-test/clock', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (!this.waiting() || generation !== this.waitingGeneration) return
      const effective = Date.parse(clock.effectiveInstant), midnight = Date.parse(clock.nextMidnight)
      if (!Number.isFinite(effective) || !Number.isFinite(midnight) || midnight <= effective || clock.simulated !== this.testMode()) throw new Error('Invalid clock projection')
      this.waitingError.set(false)
      const expectedDate = `2026-12-${String(this.selectedDay()).padStart(2, '0')}`
      if (clock.date > expectedDate) {
        // The clock is only a hint. Read the server-authorized priority result.
        const latest = await this.requestJson<{ result: AdventResult | null }>('/v1/advent-test/results/latest-unseen', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
        if (!this.waiting() || generation !== this.waitingGeneration) return
        if (latest.result) {
          await this.showResult(latest.result, false, generation)
          if (this.result()?.answerId === latest.result.answerId) this.clockDate.set(clock.date)
        } else {
          // Another device may already have acknowledged it; still read the result from the server.
          const result = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${this.selectedDay()}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
          if (!this.waiting() || generation !== this.waitingGeneration) return
          if (!result) throw new Error('Result requires refresh')
          await this.showResult(result, true, generation)
          if (this.result()?.answerId === result.answerId) this.clockDate.set(clock.date)
        }
        return
      }
      if (clock.date < expectedDate) {
        this.remainingSeconds.set(null)
        // Refresh at each real Paris midnight without presenting it as the gift's reveal.
        if (!clock.simulated) {
          const sample = performance.now()
          this.waitingTimer = setInterval(() => {
            if (performance.now() - sample >= midnight - effective) void this.refreshWaiting(generation)
          }, 1000)
        }
        return
      }
      const sample = performance.now()
      // The server sampled during the request. Starting at receipt can only delay, never anticipate, the boundary.
      const remainingAtSample = midnight - effective
      const tick = () => {
        if (!this.waiting() || generation !== this.waitingGeneration) return
        const remaining = Math.max(0, remainingAtSample - (performance.now() - sample))
        this.remainingSeconds.set(Math.ceil(remaining / 1000))
        if (remaining === 0) {
          const wasRunning = this.waitingTimer !== null
          if (this.waitingTimer !== null) clearInterval(this.waitingTimer)
          this.waitingTimer = null
          // A simulated date remains fixed at real midnight. Never auto-advance it.
          if (!clock.simulated && wasRunning) void this.refreshWaiting(generation)
        }
      }
      tick()
      if (this.remainingSeconds()! > 0) this.waitingTimer = setInterval(tick, 1000)
    } catch (error) {
      if (!(error instanceof StaleRequestError) && this.waiting() && generation === this.waitingGeneration) {
        this.remainingSeconds.set(null); this.waitingError.set(true)
      }
    } finally {
      if (generation === this.waitingGeneration) {
        this.waitingRefreshInFlight = false
        if (this.waitingRefreshPending && this.waiting()) {
          this.waitingRefreshPending = false
          void this.refreshWaiting(generation)
        }
      }
    }
  }

  waitingPart(part: 'hours' | 'minutes' | 'seconds'): string {
    const seconds = this.remainingSeconds() ?? 0
    const value = part === 'hours' ? Math.floor(seconds / 3600) : part === 'minutes' ? Math.floor(seconds / 60) % 60 : seconds % 60
    return String(value).padStart(2, '0')
  }

  waitingTime(): string {
    return `${this.waitingPart('hours')} heures ${this.waitingPart('minutes')} minutes ${this.waitingPart('seconds')} secondes`
  }

  readonly answerState = signal<'checking' | 'available' | 'recorded' | 'closed' | 'uncertain'>('checking')
  readonly submitting = signal(false)
  readonly sessionChanged = signal(false)
  private sessionId: string | null = null
  private generation: string | null = null
  private replayToken: string | null = null
  private recordedLate = false
  readonly lateDiscovery = signal(false)
  private visibilityListener: (() => void) | null = null
  @ViewChild('entryHeading', { read: ElementRef }) private entryHeading?: ElementRef<HTMLElement>
  @ViewChild('resultHeading') private resultHeading?: ElementRef<HTMLElement>
  @ViewChild('quizHeading') private quizHeading?: ElementRef<HTMLElement>
  @ViewChild('recordedStatus') private recordedStatus?: ElementRef<HTMLElement>

  owner(name: string): string {
    if (name === 'Lutin de Noël') return 'du lutin de Noël'
    return /^[aeiouyàâéèêëîïôùûü]/i.test(name) ? `d’${name}` : `de ${name}`
  }

  ngOnInit(): void {
    this.navigationSubscription = this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) return
      const key = this.dayKeyFromUrl()
      if (key === this.dayQueryKey) return
      this.dayQueryKey = key
      this.requestedDay = this.dayFromUrl()
      void this.start()
    })
    void this.start(); setTimeout(() => this.entryHeading?.nativeElement.focus())
  }
  ngOnDestroy(): void { this.navigationSubscription?.unsubscribe(); this.projectionEpoch++; this.clearVisibilityListener(); this.stopWaiting() }
  private clearVisibilityListener(): void {
    if (this.visibilityListener) document.removeEventListener('visibilitychange', this.visibilityListener)
    this.visibilityListener = null
  }

  async start(openTestDay = false): Promise<void> {
    this.christmasFixture.set(null)
    this.replayReloadFailed.set(false)
    this.replayReloading.set(false)
    this.stopWaiting()
    this.projectionEpoch++
    this.welcome.set(false); this.welcomePreview.set(false); this.confirmationPreview.set(false); this.discoveryError.set(false)
    this.calendarOpen.set(false); this.calendarDays.set([]); this.history.set(null); this.christmasBoard.set(null); this.christmasScore.set(null); this.christmasPlace.set(null); this.christmasVictory.set(null); this.christmasPreviewOpen.set(false); this.lateDiscovery.set(false)
    this.rankingOpen.set(false)
    this.ranking.set(null)
    this.fictionalRanking.set(null)
    this.lastFictionalRanking = null
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
      const session = await this.requestJson<{ testControls: boolean; productionPreview?: boolean; sessionId: string; transitionRequired?: boolean }>('/v1/advent/session', { credentials: 'include', cache: 'no-store' })
      if (!session.sessionId) throw new Error('Invalid session')
      const params = this.router.parseUrl(this.router.url).queryParams
      if (!this.notificationParametersConsumed) {
        this.notificationParametersConsumed = true
        const day = this.dayFromUrl()
        const notificationTest = params['test'] === '1' && day !== null && session.testControls === true
        if (notificationTest) {
          this.testMode.set(true)
          this.simulatedDate.set(`2026-12-${String(day).padStart(2, '0')}`)
        }
      }
      const previewRequested = params['preview'] === '1'
      this.productionPreview.set(previewRequested && session.productionPreview === true)
      this.testControls.set(!this.productionPreview() && session.testControls === true)
      if (this.productionPreview()) { this.testMode.set(false); this.simulatedDate.set(null) }
      if (!session.testControls) { this.testMode.set(false); this.simulatedDate.set(null) }
      this.sessionId = session.sessionId
      if (session.transitionRequired) { this.transitionRequired.set(true); this.loading.set(false); return }
      const clock = await this.requestJson<{ date: string } | null>('/v1/advent-test/clock', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
      if (!clock) { this.showUnavailable(); return }
      this.clockDate.set(clock.date)
      const discovery = await this.requestJson<{ discovered: boolean; attemptId?: string | null }>('/v1/advent/discovery', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (!discovery.discovered) {
        if (!discovery.attemptId) throw new Error('Discovery attempt unavailable')
        this.discoveryAttempt = discovery.attemptId
        this.welcome.set(true); this.loading.set(false)
        setTimeout(() => this.welcomeHeading?.nativeElement.focus())
        return
      }
      if (this.productionPreview()) { this.loading.set(false); await this.openCalendar() }
      else {
        await this.enterAt(clock.date, openTestDay && this.testMode())
      }
    } catch (error) { if (!(error instanceof StaleRequestError)) { this.error.set(true); this.loading.set(false) } }
  }

  previewWelcome(): void {
    if (this.welcome() || this.loading() || this.submitting() || this.closingDay() !== null || this.pendingMutations() || this.result() || this.sessionChanged() || this.transitionRequired() || this.unavailable()) return
    this.closeRanking()
    this.christmasFixture.set(null); this.christmasPreviewOpen.set(false)
    this.welcomePreview.set(true); this.welcome.set(true); this.calendarOpen.set(false)
    setTimeout(() => this.welcomeHeading?.nativeElement.focus())
  }

  previewConfirmation(): void {
    if (!this.testMode() || !this.testControls() || !this.calendarOpen() || this.loading() || this.result()) return
    this.calendarOpen.set(false); this.confirmationPreview.set(true)
    this.preview.set(null); this.history.set(null); this.rankingOpen.set(false)
    this.quiz.set({ day: 1, name: 'Lutin de Noël', portrait: '/advent/welcome-elf-v1.webp', statements: [], genericElf: true })
    this.answerState.set('recorded')
    setTimeout(() => this.recordedStatus?.nativeElement.focus())
  }

  async discoverCalendar(): Promise<void> {
    if (!this.welcome() || this.loading()) return
    if (this.welcomePreview()) {
      this.welcomePreview.set(false); this.welcome.set(false)
      await this.openCalendar()
      return
    }
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    this.loading.set(true); this.discoveryError.set(false)
    try {
      if (!this.discoveryAttempt) throw new Error('Discovery attempt unavailable')
      const response = await this.requestJson<{ days: CalendarDay[] | null; priorityResult?: AdventResult | null }>('/v1/advent/discovery', { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ attemptId: this.discoveryAttempt }) })
      if (response.priorityResult) { await this.showResult(response.priorityResult); this.welcome.set(false); return }
      if (!response.days) throw new Error('Calendar unavailable')
      this.discoveryAttempt = null
      this.calendarDays.set(response.days); this.welcome.set(false); this.calendarOpen.set(true)
      if (this.requestedDay !== null) { this.loading.set(false); await this.openCalendar(); return }
      setTimeout(() => this.calendarHeading?.nativeElement.focus())
    } catch (error) {
      if (!(error instanceof StaleRequestError) && this.contextCurrent(epoch, identity)) this.discoveryError.set(true)
    } finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
  }

  private async showResult(result: AdventResult, historical = false, waitingGeneration?: number): Promise<void> {
    const waitingCurrent = () => waitingGeneration === undefined || (this.waiting() && this.waitingGeneration === waitingGeneration)
    if (!waitingCurrent()) return
    // Existing entry and history paths need the target day even when its content is missing.
    // Waiting transitions defer this mutation until their generation has been validated.
    if (waitingGeneration === undefined) { this.historicalResult.set(historical); this.selectedDay.set(result.day) }
    const content = await this.requestJson<FictionalQuiz | null>(`/v1/advent-test/doors/${result.day}`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
    if (!waitingCurrent()) return
    if (!content) { if (waitingGeneration !== undefined) throw new Error('Result content unavailable'); this.showUnavailable(); return }
    // Fence the content fetch and bind the replay token to the same answer.
    const state = await this.requestJson<{ status: string; replayToken?: string }>(`/v1/advent-test/doors/${result.day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
    const current = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${result.day}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
    if (!waitingCurrent()) return
    if (state.status === 'unavailable' || !current) { if (waitingGeneration !== undefined) throw new Error('Result unavailable'); this.showUnavailable(); return }
    if (state.status !== 'recorded' || (!this.memberMode && !state.replayToken) || current.answerId !== result.answerId) throw new Error('Result changed')
    this.stopWaiting()
    this.historicalResult.set(historical)
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
  private async enterAt(date: string, openTestDay = false): Promise<void> {
    this.stopWaiting()
    this.projectionEpoch++
    const returnToCalendar = this.calendarOpen()
    this.closeRanking()
    this.calendarOpen.set(false); this.calendarDays.set([]); this.history.set(null); this.christmasBoard.set(null); this.christmasScore.set(null); this.christmasPlace.set(null); this.christmasVictory.set(null); this.christmasPreviewOpen.set(false); this.lateDiscovery.set(false)
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
      if (this.requestedDay !== null) { this.loading.set(false); await this.openCalendar(); return }
      if (!returnToCalendar && date === '2026-12-25') {
        const epoch = this.projectionEpoch
        const identity = this.auth.sessionUser()?.id ?? null
        try { await this.loadChristmasScore() }
        finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
        return
      }
      this.loading.set(false)
      if (returnToCalendar) await this.openCalendar()
      else if (date < '2026-12-25') {
        const day = Math.min(24, Math.max(1, Number(date.slice(-2))))
        const state = await this.requestJson<{ status: string }>(`/v1/advent-test/doors/${day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
        if (state.status === 'recorded' && !openTestDay) {
          const priority = await this.requestJson<{ result: AdventResult | null }>('/v1/advent-test/results/latest-unseen', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
          if (priority.result) { await this.showResult(priority.result); return }
        }
        await this.selectDay(day, state.status === 'recorded' && !openTestDay)
      }
      else await this.openRanking()
    }
  }

  private async loadChristmasScore(): Promise<void> {
    this.christmasBoard.set(null); this.christmasScore.set(null)
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    const date = this.clockDate()
    const calendar = this.calendarOpen()
    const ranking = this.rankingOpen()
    const mode = this.testMode()
    const simulatedDate = this.simulatedDate()
    const response = await this.requestJson<{ ranking: AdventRanking | null; priorityResult: AdventResult | null }>('/v1/advent-test/ranking', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
    if (!this.contextCurrent(epoch, identity) || date !== this.clockDate() || calendar !== this.calendarOpen() || ranking !== this.rankingOpen() || mode !== this.testMode() || simulatedDate !== this.simulatedDate()) throw new StaleRequestError()
    if (response.priorityResult) { await this.showResult(response.priorityResult); if (!this.result()) throw new Error('Priority result unavailable'); return }
    if (!response.ranking) throw new Error('Ranking unavailable')
    const fixture = this.testMode() ? this.christmasFixture() : null
    const board: AdventRanking = fixture ? this.christmasFixtureRanking(fixture) : response.ranking
    this.applyChristmasRanking(board)
  }

  private applyChristmasRanking(board: AdventRanking): void {
    this.christmasBoard.set(board)
    const mine = board.entries.find(entry => entry.mine)
    const highest = Math.max(0, ...board.entries.map(entry => entry.score))
    const winner = mine && highest > 0 && mine.score === highest && mine.score === board.score
    this.christmasVictory.set(winner ? (board.entries.filter(entry => entry.score === highest).length > 1 ? 'shared' : 'sole') : null)
    this.christmasPlace.set(board.score > 0 && !winner && board.rank !== null ? { rank: board.rank, tied: this.isTied(board, board.rank) } : null)
    this.christmasScore.set(board.score)
    setTimeout(() => this.christmasHeading?.nativeElement.focus())
  }

  podiumEntries(): AdventRanking['entries'] {
    return (this.christmasBoard()?.entries ?? []).filter(entry => entry.score > 0).slice(0, 3)
  }

  podiumReason(): string | null {
    const entry = this.podiumEntries().find(player => player.tieReason)
    if (!entry?.tieReason) return null
    const criterion = ({ CORRECT: 'les bonnes réponses', ANSWERS: 'le nombre de réponses', STREAK: 'la plus longue série de bonnes réponses', ATTAINMENT: 'le moment où le score final a été atteint', NAME: 'l’ordre alphabétique', ID: 'un identifiant stable' } as const)[entry.tieReason]
    return `La ${entry.rank}ᵉ place est départagée par ${criterion}.`
  }

  private christmasFixtureRanking(kind: ChristmasFixture): AdventRanking {
    if (kind === 'zero') return { score: 0, rank: null, entries: [] }
    const first = { name: 'Camille', score: 250, rank: 1, mine: false }
    const second = { name: 'Alex', score: 143, rank: 2, mine: false }
    const third = { name: 'Lou', score: 120, rank: 3, mine: false }
    if (kind === 'sole') return { score: 250, rank: 1, entries: [{ ...first, mine: true }] }
    if (kind === 'shared') return { score: 250, rank: 1, entries: [{ ...first, mine: true }, { ...second, score: 250, tieReason: 'CORRECT' }] }
    if (kind === 'participant') return { score: 143, rank: 2, entries: [first, { ...second, mine: true }] }
    return { score: 120, rank: 3, entries: [first, second, { ...third, mine: true, tieReason: 'NAME' }, { name: 'Zoé', score: 120, rank: 4, mine: false, tieReason: 'NAME' }] }
  }

  async previewChristmas(kind: ChristmasFixture): Promise<void> {
    if (!this.testMode() || !this.testControls() || this.loading() || this.submitting() || this.closingDay() !== null || this.pendingMutations() || this.result() || this.sessionChanged() || this.transitionRequired()) return
    this.welcome.set(false); this.welcomePreview.set(false)
    this.christmasFixture.set(kind)
    this.simulatedDate.set('2026-12-25')
    this.calendarOpen.set(false)
    this.loading.set(true); this.error.set(false)
    try { await this.enterAt('2026-12-25', true) }
    catch (error) { if (!(error instanceof StaleRequestError)) { this.error.set(true); this.loading.set(false) } }
  }

  selectedFutureTestDay(): boolean {
    const date = this.clockDate()
    return this.testControls() && date !== null && date < `2026-12-${String(this.selectedDay()).padStart(2, '0')}`
  }

  selectedDayIsPast(): boolean {
    return (this.clockDate() ?? '') > `2026-12-${String(this.selectedDay()).padStart(2, '0')}`
  }

  isCalendarToday(day: CalendarDay): boolean {
    return this.clockDate() === `2026-12-${String(day.day).padStart(2, '0')}`
  }

  futureGiftAppearance(day: CalendarDay): boolean {
    const date = this.clockDate()
    return this.testControls() && !this.productionPreview() && date !== null && date < `2026-12-${String(day.day).padStart(2, '0')}` && (day.state === 'today' || day.state === 'christmas')
  }

  calendarLabel(day: CalendarDay): string {
    if (day.state === 'played') return ({ pending: 'Réponse enregistrée, résultat en attente', correct: 'Bonne réponse', incorrect: 'Mauvaise réponse' })[day.outcome ?? 'pending']
    if ((this.productionPreview() || this.testControls()) && day.state === 'today' && !this.isCalendarToday(day)) return 'Cadeau disponible'
    return ({ locked: 'Verrouillé', played: 'Réponse enregistrée', today: 'Aujourd’hui', 'past-unplayed': 'Cadeau fermé', missing: 'Sans contenu', christmas: 'Résumé de Noël' })[day.state]
  }

  async openCalendar(): Promise<void> {
    this.personalResetConfirm.set(null)
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (this.loading() || this.submitting() || this.result() || this.sessionChanged()) return
    const restoreWaiting = this.waiting()
    const previousWaiting = restoreWaiting ? { day: this.selectedDay(), quiz: this.quiz(), preview: this.preview(), replay: this.replayToken, historical: this.historicalResult() } : null
    if (restoreWaiting) this.stopWaiting()
    this.loading.set(true); this.error.set(false)
    try {
      const response = await this.requestJson<{ days: CalendarDay[] | null; priorityResult: AdventResult | null }>('/v1/advent-test/calendar', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (response.priorityResult) { this.calendarOpen.set(false); this.history.set(null); await this.showResult(response.priorityResult); if (previousWaiting && !this.result()) throw new Error('Priority result unavailable'); return }
      if (!response.days) throw new Error('Calendar unavailable')
      this.replayReloadFailed.set(false)
      if (this.christmasFixture()) { this.christmasBoard.set(null); this.christmasScore.set(null); this.christmasPlace.set(null); this.christmasVictory.set(null) }
      this.christmasFixture.set(null)
      this.calendarDays.set(response.days); this.history.set(null); this.closeRanking(); this.christmasPreviewOpen.set(false); this.calendarOpen.set(true)
      if (this.confirmationPreview()) { this.confirmationPreview.set(false); this.quiz.set(null) }
      if (this.requestedDay !== null) {
        const requested = this.requestedDay
        const day = response.days.find(item => item.day === requested)
        this.loading.set(false)
        this.calendarActionMessage.set('')
        const unavailable = !day || day.state === 'locked' || day.state === 'missing'
        if (unavailable) this.calendarActionMessage.set('Ce quiz n’est pas disponible. Voici ton calendrier.')
        const priorityInterrupt = !unavailable && day ? await this.openCalendarDay(day) : false
        if (this.contextCurrent(epoch, identity) && this.unavailable() && !this.error() && !this.result()) {
          this.unavailable.set(false)
          this.calendarOpen.set(true)
          this.calendarActionMessage.set('Ce quiz n’est pas disponible. Voici ton calendrier.')
        }
        if (this.contextCurrent(epoch, identity) && !priorityInterrupt && !this.error() && !this.sessionChanged()) this.requestedDay = null
      }
      if (this.calendarOpen()) setTimeout(() => this.calendarHeading?.nativeElement.focus())
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.error.set(true)
      if (previousWaiting) { this.selectedDay.set(previousWaiting.day); this.quiz.set(previousWaiting.quiz); this.preview.set(previousWaiting.preview); this.replayToken = previousWaiting.replay; this.historicalResult.set(previousWaiting.historical); this.unavailable.set(false); await this.beginWaiting() } }
    finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
  }

  currentPlayedDay(): CalendarDay | undefined {
    const date = this.clockDate()
    if (!date || !/^2026-12-(0[1-9]|1[0-9]|2[0-4])$/.test(date)) return undefined
    return this.calendarDays().find(day => day.state === 'played' && this.isCalendarToday(day))
  }

  requestPersonalReset(action: 'calendar' | 'replay'): void {
    this.personalResetConfirm.set(action)
    setTimeout(() => this.personalResetHeading?.nativeElement.focus())
  }

  cancelPersonalReset(): void {
    this.personalResetConfirm.set(null)
    setTimeout(() => ((this.productionPreview() || (!this.testMode() && this.selectedFutureTestDay())) ? this.previewReplayButton : this.openingReplayButton)?.nativeElement.focus())
  }

  async confirmPersonalReset(): Promise<void> {
    const action = this.personalResetConfirm()
    this.personalResetConfirm.set(null)
    if (!this.testMode() && !this.productionPreview() && !this.selectedFutureTestDay()) return
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

  async openCalendarDay(day: CalendarDay): Promise<boolean | void> {
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    if (day.state === 'locked' || this.loading()) return
    if (day.state === 'christmas') {
      this.christmasError.set(false); this.loading.set(true)
      try {
        await this.loadChristmasScore()
        if (!this.result()) { this.christmasPreviewOpen.set((this.clockDate() ?? '') < '2026-12-25'); this.calendarOpen.set(false); this.history.set(null); this.quiz.set(null); this.preview.set(null); this.unavailable.set(false); setTimeout(() => this.christmasHeading?.nativeElement.focus()) }
      } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
        this.christmasError.set(true) }
      finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
      return
    }
    if (day.state === 'today' || (day.state === 'played' && (this.clockDate() === `2026-12-${String(day.day).padStart(2, '0')}` || (this.testControls() && (this.clockDate() ?? '') < `2026-12-${String(day.day).padStart(2, '0')}`)))) {
      this.lateDiscovery.set(false)
      this.calendarOpen.set(false); this.history.set(null); this.unavailable.set(false); await this.selectDay(day.day, day.state === 'played' && day.outcome === 'pending'); return
    }
    if (day.state === 'missing') { this.history.set(null); this.calendarOpen.set(false); this.unavailable.set(true); this.selectedDay.set(day.day); return }
    this.loading.set(true); this.error.set(false)
    try {
      const history = await this.requestJson<History & { priorityResult: AdventResult | null }>(`/v1/advent-test/doors/${day.day}/history`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (history.priorityResult) { this.calendarOpen.set(false); await this.showResult(history.priorityResult); return true }
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
    const restoreWaiting = this.waiting()
    const previousWaiting = restoreWaiting ? { day: this.selectedDay(), quiz: this.quiz(), preview: this.preview(), replay: this.replayToken, historical: this.historicalResult() } : null
    if (restoreWaiting) this.stopWaiting()
    this.loading.set(true)
    this.error.set(false)
    this.rankingError.set(false)
    try {
      const response = await this.requestJson<{ ranking: AdventRanking | null; priorityResult: AdventResult | null }>('/v1/advent-test/ranking', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (response.priorityResult) { await this.showResult(response.priorityResult); if (previousWaiting && !this.result()) throw new Error('Priority result unavailable'); return }
      if (!response.ranking) throw new Error('Ranking unavailable')
      const previewBoard = this.christmasFixture() && this.testMode() && this.testControls() ? this.christmasBoard() : null
      if (previewBoard) this.applyChristmasRanking(response.ranking)
      this.christmasFixture.set(null)
      this.ranking.set(response.ranking)
      this.fictionalRanking.set(previewBoard)
      if (this.confirmationPreview()) { this.confirmationPreview.set(false); this.quiz.set(null) }
      this.calendarOpen.set(false); this.history.set(null)
      this.replayReloadFailed.set(false)
      this.rankingOpen.set(true)
      setTimeout(() => this.rankingHeading?.nativeElement.focus())
    } catch (error) {
      if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
      this.rankingError.set(true)
      if (previousWaiting) { this.selectedDay.set(previousWaiting.day); this.quiz.set(previousWaiting.quiz); this.preview.set(previousWaiting.preview); this.replayToken = previousWaiting.replay; this.historicalResult.set(previousWaiting.historical); this.unavailable.set(false); await this.beginWaiting() } }
    finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
  }

  closeRanking(restoreFocus = false): void {
    this.rankingOpen.set(false)
    this.ranking.set(null)
    this.fictionalRanking.set(null)
    this.lastFictionalRanking = null
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
    this.christmasFixture.set(null)
    this.simulatedDate.set(target)
    try { await this.enterAt(target, true) }
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
      if (this.requestedDay !== null) { this.loading.set(false); await this.openCalendar(); return }
      if (clock.date === '2026-12-25') {
        const epoch = this.projectionEpoch
        const identity = this.auth.sessionUser()?.id ?? null
        try { await this.loadChristmasScore() }
        finally { if (this.contextCurrent(epoch, identity)) this.loading.set(false) }
        return
      }
      this.loading.set(false)
      if (clock.date > '2026-12-25') { await this.openRanking(); return }
      const day = Math.min(24, Math.max(1, Number(clock.date.slice(-2))))
      const state = await this.requestJson<{ status: string }>(`/v1/advent-test/doors/${day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (state.status === 'recorded' && !this.testMode()) {
        const priority = await this.requestJson<{ result: AdventResult | null }>('/v1/advent-test/results/latest-unseen', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
        if (priority.result) { await this.showResult(priority.result); return }
      }
      await this.selectDay(day, state.status === 'recorded' && !this.testMode())
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

  async selectDay(day: number, calendarRevisit = false): Promise<void> {
    this.stopWaiting()
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
        this.requestJson<{ status: 'available' | 'recorded' | 'closed' | 'unavailable'; replayToken?: string; late?: boolean }>(`/v1/advent-test/doors/${day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }),
      ])
      if (!content) { this.showUnavailable(); return }
      if (state.status === 'unavailable') { this.showUnavailable(); return }
      if (!['available', 'recorded', 'closed'].includes(state.status)) throw new Error('Invalid state')
      if (!this.memberMode && state.status === 'recorded' && !state.replayToken) throw new Error('Invalid state')
      this.preview.set(content)
      if (state.status === 'recorded') {
        const result = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${day}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
        if (result) {
          await this.showResult(result, this.productionPreview() || this.selectedFutureTestDay())
          return
        }
        this.replayToken = state.replayToken ?? null
        this.answerState.set('recorded')
        this.quiz.set(content)
        if (calendarRevisit && !state.late) {
          await this.beginWaiting()
          if (this.waiting() && this.contextCurrent(epoch, identity)) setTimeout(() => {
            if (this.waiting() && this.contextCurrent(epoch, identity)) this.recordedStatus?.nativeElement.focus()
          })
        }
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
    try { await this.enterAt(target, this.testMode()) }
    catch (error) { if (!(error instanceof StaleRequestError)) { this.error.set(true); this.loading.set(false) } }
  }

  async previousDay(): Promise<void> {
    const target = this.shiftedDate(-1)
    if (!this.testMode() || !target || this.loading() || this.submitting() || this.closingDay() !== null || (this.quiz() && this.answerState() === 'checking')) return
    this.loading.set(true)
    this.error.set(false)
    this.christmasFixture.set(null)
    this.simulatedDate.set(target)
    try { await this.enterAt(target, true) }
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
      if (data.status === 'available' && data.late === true) this.lateDiscovery.set(true)
      this.answerState.set(data.status)
      this.recordedLate = data.late === true
      if (data.status === 'recorded' && !this.submitting()) {
        if (this.productionPreview()) await this.showPreviewResult()
        else if (this.recordedLate) await this.showLateResult()
      }
    } catch (error) { if (!(error instanceof StaleRequestError)) { this.generation = null; this.answerState.set('uncertain') } }
  }

  async retryReplayContent(): Promise<void> {
    if (this.loading() || this.submitting()) return
    const epoch = this.projectionEpoch
    const identity = this.auth.sessionUser()?.id ?? null
    this.replayReloading.set(true)
    try {
      await this.selectDay(this.selectedDay())
      if (this.contextCurrent(epoch, identity) && !this.error()) this.replayReloadFailed.set(false)
    } finally {
      if (this.contextCurrent(epoch, identity)) this.replayReloading.set(false)
    }
  }

  async replay(): Promise<void> {
    this.stopWaiting()
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
        const previousContent = historical?.quiz ?? this.resultContent()
        this.history.set(null)
        this.result.set(null)
        this.resultContent.set(null)
        this.quiz.set(null)
        this.preview.set(null)
        if (this.productionPreview() || this.selectedFutureTestDay()) {
          this.replayReloadFailed.set(false)
          this.replayReloading.set(true)
          try {
            const currentContent = await this.requestJson<FictionalQuiz | null>(`/v1/advent-test/doors/${this.selectedDay()}`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
            if (!currentContent) throw new Error('Quiz unavailable')
            this.quiz.set(currentContent)
            this.preview.set(currentContent)
          } catch (error) {
            if (!(error instanceof StaleRequestError) && this.contextCurrent(epoch, identity)) this.replayReloadFailed.set(true)
            throw error
          } finally {
            if (this.contextCurrent(epoch, identity)) this.replayReloading.set(false)
          }
        } else this.quiz.set(previousContent)
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
      if (this.answerState() === 'recorded' && this.productionPreview()) {
        try { await this.showPreviewResult(); return } catch (error) {
          if (error instanceof StaleRequestError || !this.contextCurrent(epoch, identity)) return
          this.answerState.set('uncertain'); return
        }
      }
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
    if (!result && this.testMode() && this.clockDate() === `2026-12-${String(this.selectedDay()).padStart(2, '0')}`) {
      const epoch = this.projectionEpoch
      const identity = this.auth.sessionUser()?.id ?? null
      setTimeout(() => { if (this.contextCurrent(epoch, identity)) this.recordedStatus?.nativeElement.focus() })
      return
    }
    if (!result || !result.late) throw new Error('Late result unavailable')
    await this.showResult(result, true)
  }

  private async showPreviewResult(): Promise<void> {
    const result = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${this.selectedDay()}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
    if (!result) throw new Error('Preview result unavailable')
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
            this.fictionalRanking.set(null)
            this.lastFictionalRanking = null
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
      ...(this.productionPreview() ? { 'X-Advent-Preview': 'true' } : {}),
      ...(this.testMode() ? { 'X-Advent-Test-Mode': 'true' } : {}),
      ...(this.testMode() && this.simulatedDate() ? { 'X-Advent-Simulated-Date': this.simulatedDate()! } : {}),
    }
  }

  private csrfHeaders(): Record<string, string> {
    const token = document.cookie.split('; ').find(item => item.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
    return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}
  }

}
