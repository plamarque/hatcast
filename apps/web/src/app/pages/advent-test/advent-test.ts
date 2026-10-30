import { Component, ElementRef, ViewChild, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatRadioModule } from '@angular/material/radio'
import { RouterLink } from '@angular/router'

const REQUEST_TIMEOUT_MS = 10_000

interface FictionalQuiz { day: number; name: string; portrait: string; statements: string[]; genericElf: boolean }

@Component({
  selector: 'app-advent-test',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatRadioModule, RouterLink],
  templateUrl: './advent-test.html',
  styleUrl: './advent-test.scss',
})
export class AdventTest {
  readonly selectedDay = signal(1)
  readonly preview = signal<FictionalQuiz | null>(null)
  readonly loading = signal(false)
  readonly error = signal(false)
  readonly quiz = signal<FictionalQuiz | null>(null)
  readonly choice = signal<number | null>(null)
  readonly answerState = signal<'checking' | 'available' | 'recorded' | 'closed' | 'uncertain'>('checking')
  readonly submitting = signal(false)
  private generation: string | null = null
  private replayToken: string | null = null
  @ViewChild('quizHeading') private quizHeading?: ElementRef<HTMLElement>
  @ViewChild('recordedStatus') private recordedStatus?: ElementRef<HTMLElement>

  owner(name: string): string {
    if (name === 'Lutin de Noël') return 'du lutin de Noël'
    return /^[aeiouyàâéèêëîïôùûü]/i.test(name) ? `d’${name}` : `de ${name}`
  }

  ngOnInit(): void { void this.selectDay(1) }

  async selectDay(day: number): Promise<void> {
    if (this.loading() || this.submitting() || (this.quiz() && this.answerState() === 'checking')) return
    this.selectedDay.set(day)
    this.quiz.set(null)
    this.choice.set(null)
    this.answerState.set('checking')
    this.preview.set(null)
    this.loading.set(true)
    this.error.set(false)
    try {
      const content = await this.requestJson<FictionalQuiz>(`/v1/advent-test/doors/${day}`, { credentials: 'include', cache: 'no-store' })
      const state = await this.requestJson<{ status: 'available' | 'recorded' | 'closed'; replayToken?: string }>(`/v1/advent-test/doors/${day}/answer`, { credentials: 'include', cache: 'no-store' })
      if (!['available', 'recorded', 'closed'].includes(state.status)) throw new Error('Invalid state')
      if (state.status === 'recorded' && !state.replayToken) throw new Error('Invalid state')
      this.preview.set(content)
      if (state.status === 'recorded') {
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

  previousDay(): void {
    if (this.selectedDay() > 1) void this.selectDay(this.selectedDay() - 1)
  }

  nextDay(): void {
    if (this.selectedDay() < 24) void this.selectDay(this.selectedDay() + 1)
  }

  resetDay(): void { void this.selectDay(1) }

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
      const data = await this.requestJson<{ status: 'available' | 'recorded' | 'closed'; generation?: string; replayToken?: string }>(`/v1/advent-test/doors/${this.selectedDay()}/answer/reconcile`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: this.csrfHeaders() })
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
    try {
      const result = await this.requestJson<{ status: string; replayToken?: string }>(`/v1/advent-test/doors/${this.selectedDay()}/answer/replay`, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { ...this.csrfHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ replayToken: this.replayToken }) })
      if (result.status === 'recorded' && !result.replayToken) throw new Error('Invalid state')
      if (!['available', 'recorded', 'closed'].includes(result.status)) throw new Error('Invalid state')
      await this.reconcile()
      setTimeout(() => (this.answerState() === 'recorded' ? this.recordedStatus : this.quizHeading)?.nativeElement.focus())
    } catch { this.generation = null; this.answerState.set('uncertain') }
    finally { this.submitting.set(false) }
  }

  async confirm(): Promise<void> {
    const choice = this.choice()
    if (choice === null || this.submitting() || this.answerState() !== 'available' || !this.generation) return
    this.submitting.set(true)
    try {
      const attemptId = crypto.randomUUID()
      const url = `/v1/advent-test/doors/${this.selectedDay()}/answer`
      const headers = { ...this.csrfHeaders(), 'Content-Type': 'application/json' }
      const reserved = await this.requestJson<{ status: 'available' | 'recorded' | 'closed'; replayToken?: string }>(`${url}/reserve`, {
        method: 'POST', credentials: 'include', cache: 'no-store', headers, body: JSON.stringify({ attemptId, generation: this.generation }),
      })
      if (reserved.status === 'recorded') { if (!reserved.replayToken) throw new Error('Invalid state'); this.replayToken = reserved.replayToken; this.answerState.set('recorded'); return }
      if (reserved.status === 'closed') { this.answerState.set('closed'); return }
      if (reserved.status !== 'available') throw new Error('Uncertain')
      const data = await this.requestJson<{ status: 'recorded' | 'closed'; replayToken?: string }>(url, {
        method: 'POST', credentials: 'include', cache: 'no-store', headers, body: JSON.stringify({ choice, attemptId }),
      })
      if (data.status !== 'recorded' && data.status !== 'closed') throw new Error('Uncertain')
      if (data.status === 'recorded' && !data.replayToken) throw new Error('Invalid state')
      this.replayToken = data.replayToken ?? null
      this.answerState.set(data.status)
    } catch { await this.reconcile() }
    finally {
      this.submitting.set(false)
      if (this.answerState() === 'recorded') setTimeout(() => this.recordedStatus?.nativeElement.focus())
    }
  }

  private async requestJson<T>(url: string, options: RequestInit): Promise<T> {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('Timeout')) }, REQUEST_TIMEOUT_MS)
    })
    try {
      return await Promise.race([
        (async () => {
          const response = await fetch(url, { ...options, signal: controller.signal })
          if (!response.ok) throw new Error('Unavailable')
          return await response.json() as T
        })(),
        timeout,
      ])
    } finally { clearTimeout(timer) }
  }

  private csrfHeaders(): Record<string, string> {
    const token = document.cookie.split('; ').find(item => item.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
    return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}
  }

}
