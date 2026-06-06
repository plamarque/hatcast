import { Component, input, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonToggleModule } from '@angular/material/button-toggle'

import {
  effectiveMemberGender,
  MEMBER_GENDER_FIELD_LABEL,
  MEMBER_GENDER_OPTIONS,
  type MemberGender,
} from '../../core/account/member-gender'

@Component({
  selector: 'app-participant-gender-toggle-field',
  imports: [FormsModule, MatButtonToggleModule],
  template: `
    <div class="participant-gender-field">
      @if (readOnlyManagedOnAccount()) {
        <p class="participant-gender-field__managed-hint">
          Le genre est géré par le membre sur Mon compte.
        </p>
        <mat-button-toggle-group
          class="participant-gender-field__toggle"
          data-testid="participant-gender-group"
          [disabled]="true"
          [ngModel]="displayGender()"
          hideSingleSelectionIndicator
        >
          @for (option of genderOptions; track option.value) {
            <mat-button-toggle
              [value]="option.value"
              [class]="toggleToneClass(option.value)"
              [attr.aria-label]="option.label"
              [attr.data-testid]="'participant-gender-' + option.value.replace('_', '-')"
            >
              {{ option.toggleLabel }}
            </mat-button-toggle>
          }
        </mat-button-toggle-group>
      } @else if (!disabled()) {
        <p class="participant-gender-field__label" id="participant-gender-label">{{ fieldLabel }}</p>
        <mat-button-toggle-group
          name="participantGender"
          class="participant-gender-field__toggle"
          data-testid="participant-gender-group"
          [ngModel]="value()"
          (ngModelChange)="onValueChange($event)"
          hideSingleSelectionIndicator
          aria-labelledby="participant-gender-label"
        >
          @for (option of genderOptions; track option.value) {
            <mat-button-toggle
              [value]="option.value"
              [class]="toggleToneClass(option.value)"
              [attr.aria-label]="option.label"
              [attr.data-testid]="'participant-gender-' + option.value.replace('_', '-')"
            >
              {{ option.toggleLabel }}
            </mat-button-toggle>
          }
        </mat-button-toggle-group>
      }
    </div>
  `,
  styleUrl: './participant-gender-toggle-field.scss',
})
export class ParticipantGenderToggleField {
  readonly value = model<MemberGender>('non_specified')
  readonly disabled = input(false)
  readonly readOnlyManagedOnAccount = input(false)
  readonly accountGender = input<MemberGender | null | undefined>(null)

  protected readonly fieldLabel = MEMBER_GENDER_FIELD_LABEL
  protected readonly genderOptions = MEMBER_GENDER_OPTIONS

  protected displayGender(): MemberGender {
    const account = this.accountGender()
    if (account && effectiveMemberGender(account) !== 'non_specified') {
      return effectiveMemberGender(account)
    }
    return this.value()
  }

  protected toggleToneClass(gender: MemberGender): string {
    switch (gender) {
      case 'female':
        return 'participant-gender-field__toggle-option--female'
      case 'male':
        return 'participant-gender-field__toggle-option--male'
      default:
        return 'participant-gender-field__toggle-option--neutral'
    }
  }

  protected onValueChange(next: MemberGender): void {
    this.value.set(next)
  }
}
