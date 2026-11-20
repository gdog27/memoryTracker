import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Memory, MonthGroup, Category, AVAILABLE_MOODS } from '../../models/memory.model';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-wrapper">
      @if (monthGroups().length === 0) {
        <div class="empty-state">
          <div class="empty-icon-box">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="13" y2="13"></line>
            </svg>
          </div>
          <h3 class="empty-title">No memories found</h3>
          <p class="empty-description">
            There are no memories matching your current filters or search term. Try adjusting your filters or capture a new moment.
          </p>
          <button 
            type="button" 
            class="btn btn-primary btn-sm"
            (click)="openCreateMemory.emit()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Log a Memory</span>
          </button>
        </div>
      } @else {
        <!-- Month by Month Timeline -->
        <div class="timeline-stream">
          @for (group of monthGroups(); track group.monthKey) {
            <section class="month-section">
              <!-- Month Header Milestone -->
              <div class="month-milestone">
                <div class="month-indicator-square"></div>
                <div class="month-badge">
                  <span class="month-name">{{ group.monthLabel }}</span>
                  <span class="month-count-tag">{{ group.memories.length }} {{ group.memories.length === 1 ? 'entry' : 'entries' }}</span>
                </div>
                <div class="month-divider-line"></div>
              </div>

              <!-- Memory Cards list for this month -->
              <div class="month-memories-list">
                @for (memory of group.memories; track memory.id) {
                  <article class="memory-card">
                    <div class="card-spine">
                      <div class="spine-dot"></div>
                      <div class="spine-line"></div>
                    </div>

                    <div class="card-inner">
                      <!-- Card Header: Date, Mood & Category Badge -->
                      <div class="card-header">
                        <div class="card-tags">
                          <span class="memory-date-label">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {{ formatDate(memory.memory_date) }}
                          </span>

                          <!-- Mood badge - Clean subtle rounded tag -->
                          @if (getMoodConfig(memory.mood); as moodCfg) {
                            <span 
                              class="mood-badge"
                              [style.background-color]="moodCfg.bgColor"
                              [style.color]="moodCfg.textColor"
                              [style.border-color]="moodCfg.borderColor">
                              <span>{{ moodCfg.name }}</span>
                            </span>
                          }

                          <!-- Category badge - Clean subtle rounded tag -->
                          <span class="category-pill">
                            {{ getCategoryName(memory.category_id) }}
                          </span>
                        </div>

                        <!-- Action controls: Edit & Delete -->
                        <div class="card-actions">
                          <button 
                            type="button" 
                            class="action-btn"
                            (click)="editMemory.emit(memory)"
                            title="Edit memory">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              <path d="m15 5 4 4"></path>
                            </svg>
                          </button>
                          <button 
                            type="button" 
                            class="action-btn delete-action"
                            (click)="onDelete(memory)"
                            title="Delete memory">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <!-- Memory Title -->
                      <h3 class="memory-title">{{ memory.title }}</h3>

                      <!-- Memory Photo (if attached) -->
                      @if (memory.photo_path) {
                        <div class="memory-photo-container" (click)="openImage.emit(memory.photo_path)">
                          <img 
                            [src]="memory.photo_path" 
                            [alt]="memory.title" 
                            class="memory-image"
                            loading="lazy"
                          />
                          <div class="photo-overlay-indicator">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <polyline points="9 21 3 21 3 15"></polyline>
                              <line x1="21" y1="3" x2="14" y2="10"></line>
                              <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                            <span>Click to expand</span>
                          </div>
                        </div>
                      }

                      <!-- Memory Content (Text) -->
                      <div class="memory-text-body">
                        {{ memory.content }}
                      </div>
                    </div>
                  </article>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline-wrapper {
      position: relative;
    }

    .timeline-stream {
      position: relative;
    }

    .month-section {
      margin-bottom: 32px;
    }

    .month-milestone {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      position: relative;
    }

    .month-indicator-square {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background-color: var(--accent-vibrant);
      z-index: 2;
      flex-shrink: 0;
    }

    .month-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-xs);
      flex-shrink: 0;
    }

    .month-name {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text-main);
    }

    .month-count-tag {
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-muted);
      border-left: 1px solid var(--border-subtle);
      padding-left: 8px;
    }

    .month-divider-line {
      flex: 1;
      height: 1px;
      background-color: var(--border-subtle);
    }

    .month-memories-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-left: 4px;
    }

    .memory-card {
      display: flex;
      gap: 14px;
      position: relative;
    }

    .card-spine {
      width: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .spine-dot {
      width: 6px;
      height: 6px;
      border-radius: 2px;
      background-color: var(--border-strong);
      margin-top: 20px;
      z-index: 1;
    }

    .spine-line {
      width: 1px;
      flex: 1;
      background-color: var(--border-subtle);
      margin-top: -3px;
      margin-bottom: -16px;
    }

    /* Clean memory card with subtle rounded corners and NO floaty hover translation */
    .card-inner {
      flex: 1;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
      transition: border-color var(--transition-fast);
    }
    .card-inner:hover {
      border-color: var(--border-strong);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .card-tags {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .memory-date-label {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: -0.01em;
    }

    .mood-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: var(--radius-xs);
      font-size: 11px;
      font-weight: 600;
      border: 1px solid transparent;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .category-pill {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
      background-color: var(--bg-surface-subtle);
      border: 1px solid var(--border-subtle);
      padding: 2px 7px;
      border-radius: var(--radius-xs);
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-xs);
      border: 1px solid transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      transition: all var(--transition-fast);
    }
    .action-btn:hover {
      border-color: var(--border-strong);
      background-color: var(--bg-surface-subtle);
      color: var(--text-main);
    }
    .action-btn.delete-action:hover {
      border-color: var(--danger-border);
      background-color: var(--danger-soft);
      color: var(--danger-color);
    }

    .memory-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin-bottom: 10px;
      line-height: 1.3;
    }

    .memory-photo-container {
      position: relative;
      margin-bottom: 14px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: zoom-in;
      border: 1px solid var(--border-subtle);
      background-color: #000000;
      max-height: 420px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .memory-image {
      width: 100%;
      height: auto;
      max-height: 420px;
      object-fit: cover;
      display: block;
      border-radius: var(--radius-sm);
    }

    .photo-overlay-indicator {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: #FFFFFF;
      padding: 4px 8px;
      border-radius: var(--radius-xs);
      font-size: 11px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
    .memory-photo-container:hover .photo-overlay-indicator {
      opacity: 1;
    }

    .memory-text-body {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Empty state */
    .empty-state {
      background: var(--bg-surface);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-md);
      padding: 48px 24px;
      text-align: center;
      max-width: 500px;
      margin: 32px auto;
    }

    .empty-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface-subtle);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .empty-description {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 18px;
    }

    @media (max-width: 640px) {
      .month-section {
        margin-bottom: 24px;
      }
      .card-inner {
        padding: 14px;
      }
      .card-spine {
        display: none;
      }
      .month-memories-list {
        padding-left: 0;
        gap: 12px;
      }
      .memory-title {
        font-size: 15.5px;
        margin-bottom: 8px;
      }
      .memory-photo-container {
        max-height: 260px;
      }
      .photo-overlay-indicator {
        opacity: 1;
        font-size: 10px;
      }
    }
  `]
})
export class TimelineComponent {
  readonly supabase = inject(SupabaseService);

  readonly monthGroups = input.required<MonthGroup[]>();
  readonly editMemory = output<Memory>();
  readonly deleteMemory = output<Memory>();
  readonly openCreateMemory = output<void>();
  readonly openImage = output<string>();

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  getMoodConfig(moodName: string) {
    const norm = (moodName || '').toLowerCase();
    return AVAILABLE_MOODS.find(m => m.value === norm || m.name.toLowerCase() === norm) || null;
  }

  getCategoryName(categoryId: number | string | null | undefined): string {
    if (categoryId === null || categoryId === undefined) return 'General';
    const cat = this.supabase.categories().find(c => String(c.id) === String(categoryId));
    return cat ? cat.name : 'General';
  }

  onDelete(memory: Memory): void {
    if (confirm(`Are you sure you want to delete "${memory.title}"? This cannot be undone.`)) {
      this.deleteMemory.emit(memory);
    }
  }
}
