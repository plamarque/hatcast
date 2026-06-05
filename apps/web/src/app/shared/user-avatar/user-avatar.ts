import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  HostBinding,
  inject,
  input,
  output,
  signal,
} from '@angular/core'

import {
  effectiveMemberGender,
  type MemberGender,
} from '../../core/account/member-gender'

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
})
export class UserAvatarComponent {
  private readonly cdr = inject(ChangeDetectorRef)

  readonly displayName = input.required<string>()
  readonly avatarUrl = input<string | null>(null)
  readonly size = input(32)
  readonly clickable = input(false)
  /** Letter fallback tone when no photo — grey / orange / violet (see --hatcast-member-gender-*). */
  readonly gender = input<MemberGender | null>(null)

  readonly avatarClick = output<void>()

  protected readonly imageFailed = signal(false)

  constructor() {
    effect(() => {
      this.avatarUrl()
      this.imageFailed.set(false)
    })
  }

  @HostBinding('class')
  protected get toneClass(): string {
    switch (effectiveMemberGender(this.gender())) {
      case 'female':
        return 'user-avatar--tone-female'
      case 'male':
        return 'user-avatar--tone-male'
      default:
        return 'user-avatar--tone-neutral'
    }
  }

  protected readonly initial = computed(() => {
    const name = this.displayName().trim()
    return name ? name.charAt(0).toUpperCase() : '?'
  })

  protected readonly showImage = computed(
    () => !!this.avatarUrl() && !this.imageFailed(),
  )

  /** Small avatars (selects, lists) load eagerly so error fallback runs before paint. */
  protected readonly imageLoading = computed(() =>
    this.size() <= 32 ? 'eager' : 'lazy',
  )

  protected onImageError(): void {
    this.imageFailed.set(true)
    this.cdr.markForCheck()
  }

  protected onAvatarClick(event: MouseEvent): void {
    if (!this.clickable()) {
      return
    }
    event.stopPropagation()
    this.avatarClick.emit()
  }

  protected onAvatarKeydown(event: KeyboardEvent): void {
    if (!this.clickable()) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      this.avatarClick.emit()
    }
  }
}
