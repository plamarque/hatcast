import { Component, computed, effect, input, signal } from '@angular/core'

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
})
export class UserAvatarComponent {
  readonly displayName = input.required<string>()
  readonly avatarUrl = input<string | null>(null)
  readonly size = input(32)

  protected readonly imageFailed = signal(false)

  constructor() {
    effect(() => {
      this.avatarUrl()
      this.imageFailed.set(false)
    })
  }

  protected readonly initial = computed(() => {
    const name = this.displayName().trim()
    return name ? name.charAt(0).toUpperCase() : '?'
  })

  protected readonly showImage = computed(
    () => !!this.avatarUrl() && !this.imageFailed(),
  )

  protected onImageError(): void {
    this.imageFailed.set(true)
  }
}
