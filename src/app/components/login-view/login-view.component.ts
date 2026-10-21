import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Brand / Intro Header -->
        <div class="login-header">
          <div class="brand-badge">Memora</div>
          <h2 class="login-title">
            {{ isSignUp() ? 'Create your account' : 'Welcome back' }}
          </h2>
          <p class="login-subtitle">
            {{ isSignUp() 
              ? 'Start tracking and preserving your personal memories.' 
              : 'Sign in to access your personal memory archive.' }}
          </p>
        </div>

        <!-- Mode Toggle Tabs: Sign In / Create Account -->
        <div class="auth-tabs">
          <button 
            type="button" 
            class="auth-tab"
            [class.active]="!isSignUp()"
            (click)="setMode(false)">
            Sign In
          </button>
          <button 
            type="button" 
            class="auth-tab"
            [class.active]="isSignUp()"
            (click)="setMode(true)">
            Create Account
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="login-form">
          @if (errorMessage()) {
            <div class="error-banner">{{ errorMessage() }}</div>
          }
          @if (infoMessage()) {
            <div class="info-banner">{{ infoMessage() }}</div>
          }

          <!-- Display Name (Only for Sign Up) -->
          @if (isSignUp()) {
            <div class="form-group">
              <label class="form-label" for="login-name">Display Name *</label>
              <input 
                id="login-name"
                type="text" 
                class="form-input" 
                placeholder="e.g. Gustav Strandberg"
                [(ngModel)]="displayName" 
                name="displayName"
                required
                autofocus
              />
            </div>
          }

          <!-- Email -->
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address *</label>
            <input 
              id="login-email"
              type="email" 
              class="form-input" 
              placeholder="name@domain.com"
              [(ngModel)]="email" 
              name="email"
              required
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label" for="login-password">Password *</label>
            <input 
              id="login-password"
              type="password" 
              class="form-input" 
              placeholder="••••••••"
              [(ngModel)]="password" 
              name="password"
              minlength="6"
              required
            />
            <span class="password-hint">Must be at least 6 characters.</span>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn btn-primary submit-btn"
            [disabled]="isSubmitting() || !isValid()">
            @if (isSubmitting()) {
              <span>{{ isSignUp() ? 'Creating Account...' : 'Signing In...' }}</span>
            } @else {
              <span>{{ isSignUp() ? 'Create Account' : 'Sign In' }}</span>
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }

    .login-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 440px;
      overflow: hidden;
      animation: slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .login-header {
      padding: 28px 28px 20px 28px;
      text-align: center;
    }

    .brand-badge {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      color: var(--accent-vibrant);
      letter-spacing: -0.01em;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .login-title {
      font-size: 23px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text-main);
      line-height: 1.2;
    }

    .login-subtitle {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-top: 6px;
      line-height: 1.45;
    }

    .auth-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-subtle);
      background-color: var(--bg-surface-subtle);
    }

    .auth-tab {
      flex: 1;
      padding: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      text-align: center;
      transition: all var(--transition-fast);
      position: relative;
    }
    .auth-tab:hover {
      color: var(--text-main);
    }
    .auth-tab.active {
      color: var(--text-main);
      background-color: var(--bg-surface);
    }
    .auth-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--accent-vibrant);
    }

    .login-form {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .password-hint {
      font-size: 11.5px;
      color: var(--text-muted);
    }

    .submit-btn {
      width: 100%;
      height: 44px;
      font-size: 15px;
      font-weight: 600;
      margin-top: 8px;
    }

    .error-banner {
      background: var(--danger-soft);
      color: var(--danger-color);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      line-height: 1.4;
    }

    .info-banner {
      background: var(--accent-emerald-soft);
      color: var(--accent-emerald);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      line-height: 1.4;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .login-header {
        padding: 22px 20px 16px 20px;
      }
      .login-form {
        padding: 20px;
      }
      .login-title {
        font-size: 20px;
      }
    }
  `]
})
export class LoginViewComponent {
  readonly supabase = inject(SupabaseService);

  isSignUp = signal(false);
  displayName = '';
  email = '';
  password = '';

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  infoMessage = signal<string | null>(null);

  setMode(signUp: boolean): void {
    this.isSignUp.set(signUp);
    this.errorMessage.set(null);
    this.infoMessage.set(null);
  }

  isValid(): boolean {
    if (this.isSignUp() && !this.displayName.trim()) return false;
    if (!this.email.trim() || !this.email.includes('@')) return false;
    if (!this.password || this.password.length < 6) return false;
    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    if (this.isSignUp()) {
      const res = await this.supabase.signUp(
        this.email.trim(),
        this.password,
        this.displayName.trim()
      );
      this.isSubmitting.set(false);

      if (res.success) {
        this.infoMessage.set('Account created successfully!');
      } else {
        this.errorMessage.set(res.error || 'Failed to create account.');
      }
    } else {
      const res = await this.supabase.signIn(this.email.trim(), this.password);
      this.isSubmitting.set(false);

      if (!res.success) {
        this.errorMessage.set(res.error || 'Invalid email or password.');
      }
    }
  }
}
