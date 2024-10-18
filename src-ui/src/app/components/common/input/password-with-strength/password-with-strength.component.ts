import { Component, Input, forwardRef } from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import * as zxcvbn from 'zxcvbn'
import { AbstractInputComponent } from '../abstract-input'

@Component({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordWithStrengthComponent),
      multi: true,
    },
  ],
  selector: 'pngx-input-password-with-strength',
  templateUrl: './password-with-strength.component.html',
  styleUrls: ['./password-with-strength.component.scss'],
})
export class PasswordWithStrengthComponent extends AbstractInputComponent<string> {
  @Input()
  showReveal: boolean = false

  @Input()
  autocomplete: string

  public textVisible: boolean = false
  public passwordStrength: number = 0
  public passwordFeedback: string = ''

  public onFocus() {
    if (this.value?.replace(/\*/g, '').length === 0) {
      this.writeValue('')
    }
  }

  public onFocusOut() {
    if (this.value?.length === 0) {
      this.writeValue('**********')
      this.onChange(this.value)
    }
  }

  get disableRevealToggle(): boolean {
    return this.value?.replace(/\*/g, '').length === 0
  }

  public onValueChange(newValue: string): void {
    this.onChange(newValue)
    this.updatePasswordStrength(newValue)
  }

  private updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0
      this.passwordFeedback = ''
      return
    }

    const result = zxcvbn(password)
    this.passwordStrength = result.score
    this.passwordFeedback =
      result.feedback.warning || result.feedback.suggestions[0] || ''
  }

  public toggleVisibility(): void {
    this.textVisible = !this.textVisible
  }

  writeValue(value: string): void {
    this.value = value
    this.updatePasswordStrength(value)
  }
}
