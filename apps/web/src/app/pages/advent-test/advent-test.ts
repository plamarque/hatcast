import { Component, ElementRef, ViewChild, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

interface FictionalQuiz { day: number; name: string; portrait: string; statements: string[] }

@Component({
  selector: 'app-advent-test',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './advent-test.html',
  styleUrl: './advent-test.scss',
})
export class AdventTest {
  readonly selectedDay = signal(1)
  readonly loading = signal(false)
  readonly error = signal(false)
  readonly quiz = signal<FictionalQuiz | null>(null)
  @ViewChild('quizHeading') private quizHeading?: ElementRef<HTMLElement>

  async openDoor(): Promise<void> {
    if (this.loading()) return
    this.loading.set(true)
    this.error.set(false)
    try {
      const response = await fetch(`/v1/advent-test/doors/${this.selectedDay()}`, { credentials: 'include', cache: 'no-store' })
      if (!response.ok) throw new Error('Unavailable')
      this.quiz.set(await response.json() as FictionalQuiz)
      // Rendering and focus do not depend on animation or the motion preference.
      setTimeout(() => this.quizHeading?.nativeElement.focus())
    } catch {
      this.error.set(true)
    } finally {
      this.loading.set(false)
    }
  }
}
