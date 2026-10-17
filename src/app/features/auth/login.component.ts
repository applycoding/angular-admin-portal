import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../core/auth/auth.service';
import { DEMO_ACCOUNTS } from '../../core/auth/demo-accounts';
import { roleMessageKey } from '../../core/i18n/labels';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import type { MessageKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);

  protected readonly demos = DEMO_ACCOUNTS;
  protected readonly roleMessageKey = roleMessageKey;
  protected readonly submitting = signal(false);
  protected readonly errorKey = signal<MessageKey | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    effect(() => {
      document.title = `${this.i18n.t('auth.welcome')} · ${this.i18n.t('app.name')}`;
    });
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/dashboard');
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorKey.set(null);
    this.auth
      .login(email.trim(), password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/dashboard');
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          const status = error instanceof HttpErrorResponse ? error.status : 0;
          this.errorKey.set(status === 401 || status === 400 ? 'auth.invalidCredentials' : 'errors.loadFailed');
        },
      });
  }
}
