import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="container header-inner">
        <!-- Logo & Branding: Memora - Personal memory tracker -->
        <div class="brand-group">
          <h1 class="brand-title">
            <span class="brand-name">Memora</span>
            <span class="brand-dash">/</span>
            <span class="brand-subtitle">Personal memory tracker</span>
          </h1>
        </div>

        <!-- Right action cluster -->
        <div class="actions-group">
          <!-- Database status indicator -->
          <button 
            type="button"
            class="status-pill" 
            [class.connected]="supabase.isConnectedToSupabase()"
            (click)="openSupabaseConfig.emit()"
            title="Click to configure Supabase database credentials">
            <span class="status-dot"></span>
            <span class="status-text">
              {{ supabase.isConnectedToSupabase() ? 'Supabase Active' : 'Local Archive' }}
            </span>
            <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <!-- Manage Categories Button -->
          <button 
            type="button" 
            class="btn btn-secondary btn-sm"
            (click)="openCategoryModal.emit()"
            title="Manage memory categories">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
            </svg>
            <span class="btn-text-hideable">Categories</span>
          </button>

          <!-- Auth state / User Profile -->
          @if (supabase.currentUser(); as user) {
            <div class="user-chip">
              <div class="user-avatar" [title]="user.email">
                {{ (user.display_name || user.email).charAt(0).toUpperCase() }}
              </div>
              <div class="user-meta">
                <span class="user-name">{{ user.display_name || 'User' }}</span>
              </div>
              <button 
                type="button" 
                class="btn-icon-subtle" 
                (click)="supabase.signOut()" 
                title="Sign out">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          } @else {
            <button 
              type="button" 
              class="btn btn-secondary btn-sm" 
              (click)="openAuthModal.emit()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="btn-text-hideable">Sign In</span>
            </button>
          }

          <!-- New Memory Primary CTA -->
          <button 
            type="button" 
            class="btn btn-primary btn-sm"
            (click)="openCreateMemory.emit()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Log Memory</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      gap: 12px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      user-select: none;
      min-width: 0;
    }

    .brand-title {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: baseline;
      gap: 8px;
      line-height: 1.2;
      white-space: nowrap;
    }

    .brand-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-main);
    }

    .brand-dash {
      font-size: 14px;
      color: var(--border-strong);
      font-weight: 400;
    }

    .brand-subtitle {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      letter-spacing: -0.01em;
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      transition: border-color var(--transition-fast), background-color var(--transition-fast);
    }
    .status-pill:hover {
      border-color: var(--border-strong);
      background: var(--bg-surface-subtle);
    }
    .status-pill.connected {
      background: var(--accent-emerald-soft);
      border-color: var(--accent-emerald-border);
      color: var(--accent-emerald);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 2px;
      background: #9CA3AF;
    }
    .status-pill.connected .status-dot {
      background: var(--accent-emerald);
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
    }

    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-xs);
      background: var(--text-main);
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-name {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-main);
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-icon-subtle {
      color: var(--text-muted);
      padding: 2px;
      border-radius: var(--radius-xs);
      display: flex;
      align-items: center;
      transition: color var(--transition-fast);
    }
    .btn-icon-subtle:hover {
      color: var(--danger-color);
    }

    /* Mobile Responsive Header */
    @media (max-width: 720px) {
      .brand-subtitle, .brand-dash {
        display: none;
      }
      .user-name {
        display: none;
      }
    }

    @media (max-width: 520px) {
      .header-inner {
        height: 54px;
      }
      .status-text, .chevron-icon {
        display: none;
      }
      .status-pill {
        padding: 6px 8px;
      }
      .btn-text-hideable {
        display: none;
      }
      .btn-sm {
        padding: 5px 8px;
      }
    }
  `]
})
export class HeaderComponent {
  readonly supabase = inject(SupabaseService);

  readonly openCreateMemory = output<void>();
  readonly openCategoryModal = output<void>();
  readonly openAuthModal = output<void>();
  readonly openSupabaseConfig = output<void>();
}
