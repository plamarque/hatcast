import { Component, ElementRef, ViewChild, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatRadioModule } from '@angular/material/radio'
import { RouterLink } from '@angular/router'

const REQUEST_TIMEOUT_MS = 10_000

interface AdventResult { answerId: string; day: number; selectedChoice: number; falseChoice: number; correct: boolean; responsePoints: number; participationPoints: number; bonusPoints: number; totalPoints: number; seen: boolean; explanation?: string | null }

interface FictionalQuiz { day: number; name: string; portrait: string; statements: string[]; genericElf: boolean }

@Component({
  selector: 'app-advent-test',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatRadioModule, RouterLink],
  templateUrl: './advent-test.html',
  styleUrls: ['./advent-test.scss', './advent-result.scss'],
})
export class AdventTest {
  readonly result = signal<AdventResult | null>(null)
  readonly resultContent = signal<FictionalQuiz | null>(null)
  readonly clockDate = signal<string | null>(null)
  simulatedDay(): number | null { const date = this.clockDate(); return date ? Number(date.slice(-2)) : null }
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
  private visibilityListener: (() => void) | null = null
  @ViewChild('resultHeading') private resultHeading?: ElementRef<HTMLElement>
  @ViewChild('quizHeading') private quizHeading?: ElementRef<HTMLElement>
  @ViewChild('recordedStatus') private recordedStatus?: ElementRef<HTMLElement>

  owner(name: string): string {
    if (name === 'Lutin de Noël') return 'du lutin de Noël'
    return /^[aeiouyàâéèêëîïôùûü]/i.test(name) ? `d’${name}` : `de ${name}`
  }

  ngOnInit(): void { void this.start() }
  ngOnDestroy(): void { this.clearVisibilityListener() }
  private clearVisibilityListener(): void {
    if (this.visibilityListener) document.removeEventListener('visibilitychange', this.visibilityListener)
    this.visibilityListener = null
  }

  async start(): Promise<void> {
    this.loading.set(true)
    this.error.set(false)
    this.sessionChanged.set(false)
    this.transitionRequired.set(false)
    this.unavailable.set(false)
    try {
      const session = await this.requestJson<{ sessionId: string; transitionRequired?: boolean }>('/v1/advent-test/session', { credentials: 'include', cache: 'no-store' })
      this.sessionId = session.sessionId
      if (session.transitionRequired) { this.transitionRequired.set(true); this.loading.set(false); return }
      const clock = await this.requestJson<{ date: string }>('/v1/advent-test/clock', { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      await this.enterAt(clock.date)
    } catch { this.error.set(true); this.loading.set(false) }
  }

  private async showResult(result: AdventResult): Promise<void> {
    this.selectedDay.set(result.day)
    const content = await this.requestJson<FictionalQuiz | null>(`/v1/advent-test/doors/${result.day}`, { credentials: 'include', cache: 'no-store' }, true)
    if (!content) { this.showUnavailable(); return }
    // Fence the content fetch and bind the replay token to the same answer.
    const state = await this.requestJson<{ status: string; replayToken?: string }>(`/v1/advent-test/doors/${result.day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
    const current = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${result.day}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
    if (state.status === 'unavailable' || !current) { this.showUnavailable(); return }
    if (state.status !== 'recorded' || !state.replayToken || current.answerId !== result.answerId) throw new Error('Result changed')
    this.clearVisibilityListener()
    this.selectedDay.set(result.day)
    this.quiz.set(null)
    this.replayToken = state.replayToken
    this.answerState.set('recorded')
    this.resultContent.set(content)
    this.unavailable.set(false)
    this.result.set(current)
    this.loading.set(false)
    const display = () => {
      if (document.visibilityState !== 'visible') return
      this.clearVisibilityListener()
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const heading = this.resultHeading?.nativeElement
        if (document.visibilityState !== 'visible' || !heading?.isConnected || this.result()?.answerId !== result.answerId) {
          if (this.result()?.answerId === result.answerId && document.visibilityState !== 'visible') {
            this.visibilityListener = display
            document.addEventListener('visibilitychange', display)
          }
          return
        }
        heading.focus()
        void fetch(`/v1/advent-test/doors/${result.day}/result/acknowledge`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ answerId: result.answerId }) }).then(response => { if (response.status === 409) { this.sessionChanged.set(true); this.error.set(true) } }).catch(() => {})
      }))
    }
    if (document.visibilityState === 'visible') display()
    else { this.visibilityListener = display; document.addEventListener('visibilitychange', display) }
  }

  /** Re-enter at a simulated date, giving any eligible unseen reveal priority. */
  private async enterAt(date: string): Promise<void> {
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
      if (date < '2026-12-25') await this.selectDay(Math.min(24, Math.max(1, Number(date.slice(-2)))))
    }
  }

  async advanceClock(): Promise<void> {
    if (this.loading() || this.submitting()) return
    this.loading.set(true)
    this.error.set(false)
    try {
      const clock = await this.requestJson<{ date: string }>('/v1/advent-test/clock/next-day', { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders() } })
      await this.enterAt(clock.date)
    } catch { this.error.set(true); this.loading.set(false) }
  }

  async continueAfterResult(): Promise<void> {
    if (this.loading()) return
    this.loading.set(true)
    this.error.set(false)
    try {
      // Another tester may have advanced the shared clock while the result was displayed.
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
      if (clock.date >= '2026-12-25') return
      await this.selectDay(Math.min(24, Math.max(1, Number(clock.date.slice(-2)))))
    } catch {
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
      const content = await this.requestJson<FictionalQuiz | null>(`/v1/advent-test/doors/${day}`, { credentials: 'include', cache: 'no-store' }, true)
      if (!content) { this.showUnavailable(); return }
      const session = await this.requestJson<{ sessionId: string }>('/v1/advent-test/session', { credentials: 'include', cache: 'no-store' })
      if (!session.sessionId) throw new Error('Invalid session')
      this.sessionId = session.sessionId
      const state = await this.requestJson<{ status: 'available' | 'recorded' | 'closed' | 'unavailable'; replayToken?: string }>(`/v1/advent-test/doors/${day}/answer`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() })
      if (state.status === 'unavailable') { this.showUnavailable(); return }
      if (!['available', 'recorded', 'closed'].includes(state.status)) throw new Error('Invalid state')
      if (state.status === 'recorded' && !state.replayToken) throw new Error('Invalid state')
      this.preview.set(content)
      if (state.status === 'recorded') {
        const result = await this.requestJson<AdventResult | null>(`/v1/advent-test/doors/${day}/result`, { credentials: 'include', cache: 'no-store', headers: this.sessionHeaders() }, true)
        if (result) {
          await this.showResult(result)
          return
        }
        this.replayToken = state.replayToken!
        this.answerState.set('recorded')
        this.quiz.set(content)
      }
    } catch {
      this.error.set(true)
    } finally {
      this.loading.set(false)
    }
  }

  async previousDay(): Promise<void> {
    if (this.loading() || this.submitting() || (this.quiz() && this.answerState() === 'checking')) return
    this.loading.set(true)
    this.error.set(false)
    try {
      const clock = await this.requestJson<{ date: string }>('/v1/advent-test/clock/previous-day', { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders() } })
      await this.enterAt(clock.date)
    } catch {
      this.error.set(true)
      this.loading.set(false)
    }
  }

  async nextDay(): Promise<void> {
    if ((this.clockDate() ?? '') >= '2026-12-25') return
    await this.advanceClock()
  }

  async openDoor(): Promise<void> {
    if (this.loading() || this.submitting() || (this.quiz() && this.answerState() === 'checking')) return
    if (!this.preview()) await this.selectDay(this.selectedDay())
    const content = this.preview()
    if (content) {
      this.quiz.set(content)
      await this.reconcile()
      setTimeout(() => (this.answerState() === 'recorded' ? this.recordedStatus : this.quizHeading)?.nativeElement.focus())
    }
  }
  async reconcile(): Promise<void> {
    this.answerState.set('checking')
    try {
      const data = await this.requestJson<{ status: 'available' | 'recorded' | 'closed' | 'unavailable'; generation?: string; replayToken?: string }>(`/v1/advent-test/doors/${this.selectedDay()}/answer/reconcile`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders() } })
      if (data.status === 'unavailable') { this.showUnavailable(); return }
      if (!['available', 'recorded', 'closed'].includes(data.status)) throw new Error('Invalid state')
      if (data.status === 'available' && !data.generation) throw new Error('Invalid state')
      if (data.status === 'recorded' && !data.replayToken) throw new Error('Invalid state')
      this.generation = data.generation ?? null
      this.replayToken = data.replayToken ?? null
      this.answerState.set(data.status)
    } catch { this.generation = null; this.answerState.set('uncertain') }
  }

  async replay(): Promise<void> {
    if (this.submitting() || this.answerState() !== 'recorded' || !this.replayToken) return
    this.submitting.set(true)
    this.choice.set(null)
    const reveal = this.result()
    try {
      const result = await this.requestJson<{ status: string; replayToken?: string }>(`/v1/advent-test/doors/${this.selectedDay()}/answer/replay`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ replayToken: this.replayToken }) })
      if (result.status === 'unavailable') { this.showUnavailable(); return }
      if (result.status === 'recorded' && !result.replayToken) throw new Error('Invalid state')
      if (!['available', 'recorded', 'closed'].includes(result.status)) throw new Error('Invalid state')
      if (reveal) {
        if (result.status !== 'available') throw new Error('Result changed')
        this.clearVisibilityListener()
        this.quiz.set(this.resultContent())
        this.result.set(null)
        this.resultContent.set(null)
      }
      await this.reconcile()
      setTimeout(() => (this.answerState() === 'recorded' ? this.recordedStatus : this.quizHeading)?.nativeElement.focus())
    } catch { this.generation = null; if (reveal) this.error.set(true); else this.answerState.set('uncertain') }
    finally { this.submitting.set(false) }
  }

  async confirm(): Promise<void> {
    const choice = this.choice()
    if (choice === null || this.submitting() || this.answerState() !== 'available' || !this.generation) return
    this.submitting.set(true)
    try {
      const attemptId = crypto.randomUUID()
      const url = `/v1/advent-test/doors/${this.selectedDay()}/answer`
      const headers = { ...this.csrfHeaders(), ...this.sessionHeaders(), 'Content-Type': 'application/json' }
      const reserved = await this.requestJson<{ status: 'available' | 'recorded' | 'closed' | 'unavailable'; replayToken?: string }>(`${url}/reserve`, {
        method: 'POST', credentials: 'include', cache: 'no-store', headers, body: JSON.stringify({ attemptId, generation: this.generation }),
      })
      if (reserved.status === 'unavailable') { this.showUnavailable(); return }
      if (reserved.status === 'recorded') { if (!reserved.replayToken) throw new Error('Invalid state'); this.replayToken = reserved.replayToken; this.answerState.set('recorded'); return }
      if (reserved.status === 'closed') { this.answerState.set('closed'); return }
      if (reserved.status !== 'available') throw new Error('Uncertain')
      const data = await this.requestJson<{ status: 'recorded' | 'closed' | 'unavailable'; replayToken?: string }>(url, {
        method: 'POST', credentials: 'include', cache: 'no-store', headers, body: JSON.stringify({ choice, attemptId }),
      })
      if (data.status === 'unavailable') { this.showUnavailable(); return }
      if (data.status !== 'recorded' && data.status !== 'closed') throw new Error('Uncertain')
      if (data.status === 'recorded' && !data.replayToken) throw new Error('Invalid state')
      this.replayToken = data.replayToken ?? null
      this.answerState.set(data.status)
    } catch {
      if (this.sessionChanged()) this.answerState.set('uncertain')
      else await this.reconcile()
    }
    finally {
      this.submitting.set(false)
      if (this.answerState() === 'recorded') setTimeout(() => this.recordedStatus?.nativeElement.focus())
    }
  }

  private async requestJson<T>(url: string, options: RequestInit, notFoundAsNull = false): Promise<T> {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('Timeout')) }, REQUEST_TIMEOUT_MS)
    })
    try {
      return await Promise.race([
        (async () => {
          const response = await fetch(url, { ...options, signal: controller.signal })
          if (response.status === 409) {
            this.sessionChanged.set(true)
            this.generation = null
            this.replayToken = null
          }
          if (response.status === 404 && notFoundAsNull) return null as T
          if (!response.ok) throw new Error('Unavailable')
          return await response.json() as T
        })(),
        timeout,
      ])
    } finally { clearTimeout(timer) }
  }

  private sessionHeaders(): Record<string, string> {
    return this.sessionId ? { 'X-Advent-Test-Session': this.sessionId } : {}
  }

  private csrfHeaders(): Record<string, string> {
    const token = document.cookie.split('; ').find(item => item.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
    return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}
  }

}
