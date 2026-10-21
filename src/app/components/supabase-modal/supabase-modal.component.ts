import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-supabase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Supabase Database Connection</h2>
            <p class="modal-subtitle">Connect Memora to your live Supabase project.</p>
          </div>
          <button type="button" class="close-btn" (click)="close.emit()" title="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="onConnect()" class="modal-body">
          @if (supabase.errorMessage()) {
            <div class="error-banner">{{ supabase.errorMessage() }}</div>
          }
          @if (supabase.statusMessage()) {
            <div class="success-banner">{{ supabase.statusMessage() }}</div>
          }

          <div class="status-summary-box" [class.connected]="supabase.isConnectedToSupabase()">
            <div class="status-header">
              <span class="status-indicator"></span>
              <span class="status-title">
                {{ supabase.isConnectedToSupabase() ? 'Connected to Supabase' : 'Running in Local Archive Mode' }}
              </span>
            </div>
            <p class="status-desc">
              {{ supabase.isConnectedToSupabase() 
                ? 'Your memories, categories, and auth are currently synced directly with your live Supabase instance.' 
                : 'Memora is currently using your browser’s local storage. Enter your Supabase Project URL and Anon Key below to connect your real database.' }}
            </p>
          </div>

          <!-- Supabase Project URL -->
          <div class="form-group">
            <label class="form-label" for="sp-url">Project URL</label>
            <input 
              id="sp-url"
              type="url" 
              class="form-input" 
              placeholder="https://your-project.supabase.co"
              [(ngModel)]="url" 
              name="url"
              required
            />
          </div>

          <!-- Supabase Anon Key -->
          <div class="form-group">
            <label class="form-label" for="sp-key">Project Anon / Public API Key</label>
            <textarea 
              id="sp-key"
              class="form-textarea key-textarea" 
              rows="3"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              [(ngModel)]="key" 
              name="key"
              required>
            </textarea>
            <span class="key-hint">Found under your Supabase Project Settings → API → Project API Keys.</span>
          </div>

          <!-- Schema overview box -->
          <div class="schema-box">
            <div class="schema-title">Connected Supabase Database Tables:</div>
            <ul class="schema-list">
              <li><code>profiles</code> (id uuid, display_name varchar, created_at timestamptz)</li>
              <li><code>memories</code> (id int8, user_id uuid, title varchar, memory_date date, category_id int8, mood varchar, content text, photo_path text, created_at, updated_at)</li>
              <li><code>categories</code> (id int8, name varchar)</li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            @if (supabase.isConnectedToSupabase()) {
              <button type="button" class="btn btn-danger btn-sm" (click)="onDisconnect()">
                Disconnect & Use Local
              </button>
            }
            <div class="footer-right">
              <button type="button" class="btn btn-secondary" (click)="close.emit()">
                Close
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="isConnecting() || !url.trim() || !key.trim()">
                @if (isConnecting()) {
                  <span>Connecting...</span>
                } @else {
                  <span>{{ supabase.isConnectedToSupabase() ? 'Update Credentials' : 'Save & Connect' }}</span>
                }
              </button>
            </div>
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

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .status-summary-box {
      background: var(--bg-surface-subtle);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px 16px;
    }
    .status-summary-box.connected {
      background: var(--accent-sage-soft);
      border-color: #86EFAC;
    }

    .status-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #A8A29E;
    }
    .status-summary-box.connected .status-indicator {
      background: #16A34A;
    }

    .status-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-main);
    }
    .status-summary-box.connected .status-title {
      color: var(--accent-sage);
    }

    .status-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .key-textarea {
      min-height: 70px;
      font-family: monospace;
      font-size: 12px;
    }

    .key-hint {
      font-size: 11px;
      color: var(--text-muted);
    }

    .schema-box {
      background-color: var(--bg-page);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px 14px;
    }

    .schema-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .schema-list {
      list-style-type: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .schema-list li {
      font-size: 11.5px;
      color: var(--text-secondary);
    }

    .schema-list code {
      font-size: 11px;
      background: var(--bg-surface);
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid var(--border-subtle);
      font-family: monospace;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }

    .error-banner {
      background: var(--danger-soft);
      color: var(--danger-color);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }

    .success-banner {
      background: var(--accent-sage-soft);
      color: var(--accent-sage);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }
  `]
})
export class SupabaseModalComponent {
  readonly supabase = inject(SupabaseService);
  readonly close = output<void>();

  url = this.supabase.supabaseUrl() || '';
  key = this.supabase.supabaseAnonKey() || '';
  isConnecting = signal(false);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  async onConnect(): Promise<void> {
    if (!this.url.trim() || !this.key.trim()) return;

    this.isConnecting.set(true);
    const success = await this.supabase.initSupabaseClient(this.url.trim(), this.key.trim());
    this.isConnecting.set(false);

    if (success) {
      setTimeout(() => this.close.emit(), 1200);
    }
  }

  onDisconnect(): void {
    this.supabase.disconnectSupabase();
    this.url = '';
    this.key = '';
  }
}
