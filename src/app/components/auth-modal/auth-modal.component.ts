import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">
              {{ isSignUp() ? 'Create your Memora Archive' : 'Welcome back to Memora' }}
            </h2>
            <p class="modal-subtitle">
              {{ isSignUp() ? 'Set up an account to safeguard your personal memories.' : 'Enter your credentials to access your memory archive.' }}
            </p>
          </div>
          <button type="button" class="close-btn" (click)="close.emit()" title="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Auth Tabs: Sign In / Create Account -->
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

        <form (ngSubmit)="onSubmit()" class="modal-body">
          @if (errorMessage()) {
            <div class="error-banner">{{ errorMessage() }}</div>
          }
          @if (infoMessage()) {
            <div class="info-banner">{{ infoMessage() }}</div>
          }

          <!-- Name input (Only for Sign Up) -->
          @if (isSignUp()) {
            <div class="form-group">
              <label class="form-label" for="auth-name">Display Name *</label>
              <input 
                id="auth-name"
                type="text" 
                class="form-input" 
                placeholder="e.g. Maya Lindqvist"
                [(ngModel)]="fullName" 
                name="fullName"
                required
                autofocus
              />
            </div>
          }

          <!-- Email input -->
          <div class="form-group">
            <label class="form-label" for="auth-email">Email Address *</label>
            <input 
              id="auth-email"
              type="email" 
              class="form-input" 
              placeholder="you@domain.com"
              [(ngModel)]="email" 
              name="email"
              required
            />
          </div>

          <!-- Password input -->
          <div class="form-group">
            <label class="form-label" for="auth-password">Password *</label>
            <input 
              id="auth-password"
              type="password" 
              class="form-input" 
              placeholder="••••••••"
              [(ngModel)]="password" 
              name="password"
              minlength="6"
              required
            />
            <span class="password-hint">Minimum 6 characters.</span>
          </div>

          <div class="auth-note">
            <span class="auth-note-badge">
              {{ supabase.isConnectedToSupabase() ? '⚡ Supabase Auth' : '📁 Local Auth Mode' }}
            </span>
            <span class="auth-note-text">
              {{ supabase.isConnectedToSupabase() 
                ? 'Your session and memories will sync securely with your Supabase backend.' 
                : 'Running in local mode. You can connect your live Supabase credentials anytime.' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close.emit()">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="isSubmitting() || !isValid()">
              @if (isSubmitting()) {
                <span>Processing...</span>
              } @else {
                <span>{{ isSignUp() ? 'Create Account' : 'Sign In' }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .modal-subtitle {
      font-size: 12.5px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .close-btn {
      color: var(--text-muted);
      padding: 4px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
    }
    .close-btn:hover {
      color: var(--text-main);
      background-color: var(--bg-surface-subtle);
    }

    .auth-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-subtle);
      background-color: var(--bg-surface-subtle);
    }

    .auth-tab {
      flex: 1;
      padding: 12px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-secondary);
      text-align: center;
      transition: all var(--transition-fast);
      position: relative;
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
      background-color: var(--text-main);
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .password-hint {
      font-size: 11px;
      color: var(--text-muted);
    }

    .auth-note {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      background-color: var(--bg-surface-subtle);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      margin-top: 4px;
    }

    .auth-note-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
    }

    .auth-note-text {
      font-size: 11.5px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
    }

    .error-banner {
      background: var(--danger-soft);
      color: var(--danger-color);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }

    .info-banner {
      background: var(--accent-sage-soft);
      color: var(--accent-sage);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }
  `]
})
export class AuthModalComponent {
  readonly supabase = inject(SupabaseService);
  readonly close = output<void>();

  isSignUp = signal(false);
  fullName = '';
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

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  isValid(): boolean {
    if (this.isSignUp() && !this.fullName.trim()) return false;
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
      const res = await this.supabase.signUp(this.email.trim(), this.password, this.fullName.trim());
      this.isSubmitting.set(false);
      if (res.success) {
        this.infoMessage.set('Account created successfully! Welcome to Memora.');
        setTimeout(() => this.close.emit(), 1200);
      } else {
        this.errorMessage.set(res.error || 'Failed to create account.');
      }
    } else {
      const res = await this.supabase.signIn(this.email.trim(), this.password);
      this.isSubmitting.set(false);
      if (res.success) {
        this.infoMessage.set('Signed in successfully.');
        setTimeout(() => this.close.emit(), 1000);
      } else {
        this.errorMessage.set(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    }
  }
}
