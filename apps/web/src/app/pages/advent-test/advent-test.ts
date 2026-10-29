import { Component, ElementRef, ViewChild, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

interface FictionalQuiz { day: number; name: string; portrait: string; statements: string[]; genericElf: boolean }

@Component({
  selector: 'app-advent-test',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './advent-test.html',
  styleUrl: './advent-test.scss',
})
export class AdventTest {
  readonly selectedDay = signal(1)
  readonly preview = signal<FictionalQuiz | null>(null)
  readonly loading = signal(false)
  readonly error = signal(false)
  readonly quiz = signal<FictionalQuiz | null>(null)
  @ViewChild('quizHeading') private quizHeading?: ElementRef<HTMLElement>

  owner(name: string): string {
    if (name === 'Lutin de Noël') return 'du lutin de Noël'
    return /^[aeiouyàâéèêëîïôùûü]/i.test(name) ? `d’${name}` : `de ${name}`
  }

  ngOnInit(): void { void this.selectDay(1) }

  async selectDay(day: number): Promise<void> {
    if (this.loading()) return
    this.selectedDay.set(day)
    this.quiz.set(null)
    this.preview.set(null)
    this.loading.set(true)
    this.error.set(false)
    try {
      const response = await fetch(`/v1/advent-test/doors/${day}`, { credentials: 'include', cache: 'no-store' })
      if (!response.ok) throw new Error('Unavailable')
      this.preview.set(await response.json() as FictionalQuiz)
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
    if (this.loading()) return
    if (!this.preview()) await this.selectDay(this.selectedDay())
    const content = this.preview()
    if (content) {
      this.quiz.set(content)
      setTimeout(() => this.quizHeading?.nativeElement.focus())
    }
  }
}
