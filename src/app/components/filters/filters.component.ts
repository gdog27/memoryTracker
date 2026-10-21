import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { AVAILABLE_MOODS, MemoryFilters } from '../../models/memory.model';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="filters-container">
      <!-- Search input row -->
      <div class="search-row">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input 
            type="text" 
            class="search-input"
            placeholder="Search memories by keyword, title, or thoughts..."
            [ngModel]="filters().searchTerm"
            (ngModelChange)="onSearchChange($event)"
          />
          @if (filters().searchTerm) {
            <button type="button" class="clear-search-btn" (click)="onSearchChange('')" title="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </div>

        <div class="filter-controls-right">
          <!-- Mood Dropdown Filter -->
          <div class="mood-select-wrapper">
            <select 
              class="form-select filter-select"
              [ngModel]="filters().selectedMood || ''"
              (ngModelChange)="onMoodChange($event)">
              <option value="">All Moods</option>
              @for (mood of availableMoods; track mood.value) {
                <option [value]="mood.value">{{ mood.name }}</option>
              }
            </select>
          </div>

          <!-- Sort Order Toggle -->
          <button 
            type="button" 
            class="btn btn-secondary btn-sm sort-btn"
            (click)="toggleSort()"
            [title]="filters().sortOrder === 'desc' ? 'Showing newest first' : 'Showing oldest first'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 16 4 4 4-4"></path>
              <path d="M7 20V4"></path>
              <path d="m21 8-4-4-4 4"></path>
              <path d="M17 4v16"></path>
            </svg>
            <span>{{ filters().sortOrder === 'desc' ? 'Newest' : 'Oldest' }}</span>
          </button>
        </div>
      </div>

      <!-- Categories Pills Row -->
      <div class="categories-row">
        <div class="category-chips-list">
          <!-- All Categories Chip -->
          <button 
            type="button" 
            class="chip"
            [class.active]="filters().selectedCategoryId === null"
            (click)="selectCategory(null)">
            <span>All Categories</span>
            <span class="count-badge">{{ supabase.memories().length }}</span>
          </button>

          <!-- Individual Category Chips -->
          @for (cat of supabase.categories(); track cat.id) {
            <button 
              type="button" 
              class="chip"
              [class.active]="filters().selectedCategoryId === cat.id"
              (click)="selectCategory(cat.id)">
              <span>{{ cat.name }}</span>
              <span class="count-badge">{{ getCategoryCount(cat.id) }}</span>
            </button>
          }

          <!-- Add Category Inline Button -->
          <button 
            type="button" 
            class="chip chip-add"
            (click)="openAddCategory.emit()"
            title="Create a new category">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Category</span>
          </button>
        </div>

        @if (hasActiveFilters()) {
          <button type="button" class="btn-clear-all" (click)="resetFilters()">
            Clear Filters
          </button>
        }
      </div>
    </section>
  `,
  styles: [`
    .filters-container {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 16px;
      margin-bottom: 28px;
      box-shadow: var(--shadow-sm);
    }

    .search-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-input-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      height: 42px;
      padding: 8px 36px 8px 38px;
      font-size: 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background-color: var(--bg-page);
      color: var(--text-main);
      transition: all var(--transition-fast);
    }
    .search-input:focus {
      outline: none;
      border-color: var(--accent-vibrant);
      background-color: var(--bg-surface);
      box-shadow: 0 0 0 3px rgba(240, 90, 54, 0.15);
    }

    .clear-search-btn {
      position: absolute;
      right: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      padding: 2px;
    }
    .clear-search-btn:hover {
      color: var(--accent-vibrant);
    }

    .filter-controls-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-select {
      height: 42px;
      padding: 8px 12px;
      font-size: 13.5px;
      min-width: 136px;
      background-color: var(--bg-page);
    }

    .sort-btn {
      height: 42px;
    }

    .categories-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
    }

    .category-chips-list {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .count-badge {
      font-size: 11px;
      opacity: 0.8;
      padding-left: 2px;
      font-weight: 600;
    }

    .chip.active {
      background-color: var(--accent-vibrant);
      color: #FFFFFF;
      border-color: var(--accent-vibrant);
      box-shadow: 0 2px 6px rgba(240, 90, 54, 0.28);
    }

    .chip-add {
      background-color: transparent;
      border: 1px dashed var(--border-strong);
      color: var(--text-secondary);
    }
    .chip-add:hover {
      border-color: var(--accent-vibrant);
      color: var(--accent-vibrant);
      background-color: var(--accent-vibrant-soft);
    }

    .btn-clear-all {
      font-size: 12.5px;
      color: var(--accent-vibrant);
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-clear-all:hover {
      text-decoration: underline;
    }

    @media (max-width: 680px) {
      .filters-container {
        padding: 12px;
      }
      .search-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .filter-controls-right {
        display: flex;
        width: 100%;
        gap: 8px;
      }
      .filter-select {
        flex: 1;
      }
      .categories-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .category-chips-list {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 6px;
        width: 100%;
        -webkit-overflow-scrolling: touch;
      }
      .category-chips-list::-webkit-scrollbar {
        height: 3px;
      }
    }
  `]
})
export class FiltersComponent {
  readonly supabase = inject(SupabaseService);

  readonly filters = input.required<MemoryFilters>();
  readonly filtersChange = output<MemoryFilters>();
  readonly openAddCategory = output<void>();

  readonly availableMoods = AVAILABLE_MOODS;

  onSearchChange(term: string): void {
    this.filtersChange.emit({
      ...this.filters(),
      searchTerm: term
    });
  }

  selectCategory(catId: number | string | null): void {
    this.filtersChange.emit({
      ...this.filters(),
      selectedCategoryId: catId
    });
  }

  onMoodChange(mood: string): void {
    this.filtersChange.emit({
      ...this.filters(),
      selectedMood: mood || null
    });
  }

  toggleSort(): void {
    const nextOrder = this.filters().sortOrder === 'desc' ? 'asc' : 'desc';
    this.filtersChange.emit({
      ...this.filters(),
      sortOrder: nextOrder
    });
  }

  getCategoryCount(categoryId: number | string): number {
    return this.supabase.memories().filter(m => String(m.category_id) === String(categoryId)).length;
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!f.searchTerm || f.selectedCategoryId !== null || f.selectedMood !== null;
  }

  resetFilters(): void {
    this.filtersChange.emit({
      searchTerm: '',
      selectedCategoryId: null,
      selectedMood: null,
      selectedYear: null,
      sortOrder: 'desc'
    });
  }
}
