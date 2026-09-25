import { Component, signal, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css'
})
export class AuthPage implements AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  mode = signal<AuthMode>('login');
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

 signupForm = this.fb.nonNullable.group({
  username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
  userEmailId: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/)]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required],
  artistName: ['']
}, { validators: [passwordNotUsernameValidator(), passwordsMatchValidator()] });


  ngAfterViewInit(): void {
  this.waitForGoogleSdk().then(() => this.initGoogleButton());
}

private waitForGoogleSdk(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}
  private initGoogleButton(): void {
    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response) => this.handleGoogleCredential(response.credential)
    });

    window.google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
      theme: 'outline',
      size: 'large',
      width: 320,
       text: 'continue_with'
    });
  }

  private handleGoogleCredential(idToken: string): void {
    this.errorMessage.set(null);
    this.authService.googleLogin({ idToken }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.errorMessage.set('Google sign-in failed. Please try again.')
    });
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'signup' : 'login');
    this.errorMessage.set(null);
  }

  submitLogin(): void {
    if (this.loginForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Invalid username or password.');
      }
    });
  }

submitSignup(): void {
  if (this.signupForm.invalid) return;
  this.isSubmitting.set(true);
  this.errorMessage.set(null);

  const { confirmPassword, ...signupPayload } = this.signupForm.getRawValue();

  this.authService.signup(signupPayload).subscribe({
    next: () => {
      this.isSubmitting.set(false);
      this.mode.set('login');
      this.loginForm.patchValue({ username: signupPayload.username });
    },
    error: (err) => {
      this.isSubmitting.set(false);
      this.errorMessage.set(err.error?.message ?? 'Signup failed. Please try again.');
    }
  });
}
}

function passwordNotUsernameValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const username = group.get('username')?.value?.toLowerCase()?.trim();
    const password = group.get('password')?.value;
    if (username && password && username === password.toLowerCase().trim()) {
      return { passwordMatchesUsername: true };
    }
    return null;
  };

}
  function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  };
}


