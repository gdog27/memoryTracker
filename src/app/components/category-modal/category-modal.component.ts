import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Categories & Collections</h2>
            <p class="modal-subtitle">Organize your moments into personal themes.</p>
          </div>
          <button type="button" class="close-btn" (click)="close.emit()" title="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          @if (errorMessage()) {
            <div class="error-banner">{{ errorMessage() }}</div>
          }
          @if (successMessage()) {
            <div class="success-banner">{{ successMessage() }}</div>
          }

          <!-- Create New Category Input -->
          <form (ngSubmit)="onCreateCategory()" class="add-cat-form">
            <div class="input-with-button">
              <input 
                type="text" 
                class="form-input" 
                placeholder="New category name (e.g., Road Trips, Gardening)..." 
                [(ngModel)]="newCategoryName" 
                name="newCategoryName"
                [disabled]="isSubmitting()"
                autofocus
              />
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="isSubmitting() || !newCategoryName.trim()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add</span>
              </button>
            </div>
          </form>

          <!-- Category List -->
          <div class="cat-list-wrap">
            <div class="cat-list-header">
              <span>Existing Categories ({{ supabase.categories().length }})</span>
              @if (supabase.categories().length === 0) {
                <button type="button" class="btn-text-action" (click)="seedStarterCategories()">
                  + Seed Starter Categories
                </button>
              }
            </div>

            @if (supabase.categories().length === 0) {
              <div class="empty-cat-placeholder">
                <p>No categories in your Supabase database yet.</p>
                <button type="button" class="btn btn-secondary btn-sm" (click)="seedStarterCategories()">
                  Add Starter Themes
                </button>
              </div>
            } @else {
              <div class="cat-items">
                @for (cat of supabase.categories(); track cat.id) {
                  <div class="cat-item">
                    <div class="cat-name-group">
                      <span class="cat-icon-folder">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                        </svg>
                      </span>
                      <span class="cat-item-name">{{ cat.name }}</span>
                    </div>
                    <span class="cat-item-count">
                      {{ getMemoryCount(cat.id) }} {{ getMemoryCount(cat.id) === 1 ? 'memory' : 'memories' }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="close.emit()">
            Done
          </button>
        </div>
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
      gap: 20px;
    }

    .input-with-button {
      display: flex;
      gap: 10px;
    }

    .cat-list-wrap {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cat-list-header {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-text-action {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--accent-vibrant);
      cursor: pointer;
    }
    .btn-text-action:hover {
      text-decoration: underline;
    }

    .empty-cat-placeholder {
      padding: 24px 16px;
      text-align: center;
      background: var(--bg-surface-subtle);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .cat-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 280px;
      overflow-y: auto;
    }

    .cat-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background-color: var(--bg-surface-subtle);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }

    .cat-name-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cat-icon-folder {
      color: var(--accent-vibrant);
      display: flex;
      align-items: center;
    }

    .cat-item-name {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-main);
    }

    .cat-item-count {
      font-size: 12px;
      color: var(--text-muted);
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: flex-end;
    }

    .error-banner {
      background: var(--danger-soft);
      color: var(--danger-color);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }

    .success-banner {
      background: var(--accent-emerald-soft);
      color: var(--accent-emerald);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }
  `]
})
export class CategoryModalComponent {
  readonly supabase = inject(SupabaseService);
  readonly close = output<void>();

  newCategoryName = '';
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  getMemoryCount(categoryId: number | string): number {
    return this.supabase.memories().filter(m => String(m.category_id) === String(categoryId)).length;
  }

  async onCreateCategory(): Promise<void> {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const res = await this.supabase.createCategory(name);
    this.isSubmitting.set(false);

    if (res.success) {
      this.newCategoryName = '';
      this.successMessage.set(`Category "${name}" created.`);
      setTimeout(() => this.successMessage.set(null), 3000);
    } else {
      this.errorMessage.set(res.error || 'Failed to create category');
    }
  }

  async seedStarterCategories(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    await this.supabase.seedStarterCategories();
    this.isSubmitting.set(false);
  }
}
