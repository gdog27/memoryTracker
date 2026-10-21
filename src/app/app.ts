import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';
import { Memory, MonthGroup, MemoryFilters } from './models/memory.model';

import { HeaderComponent } from './components/header/header.component';
import { StatsComponent } from './components/stats/stats.component';
import { FiltersComponent } from './components/filters/filters.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { MemoryModalComponent } from './components/memory-modal/memory-modal.component';
import { CategoryModalComponent } from './components/category-modal/category-modal.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { SupabaseModalComponent } from './components/supabase-modal/supabase-modal.component';
import { ImageLightboxComponent } from './components/image-lightbox/image-lightbox.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    StatsComponent,
    FiltersComponent,
    TimelineComponent,
    MemoryModalComponent,
    CategoryModalComponent,
    AuthModalComponent,
    SupabaseModalComponent,
    ImageLightboxComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly supabase = inject(SupabaseService);

  // Filter state
  readonly filters = signal<MemoryFilters>({
    searchTerm: '',
    selectedCategoryId: null,
    selectedMood: null,
    selectedYear: null,
    sortOrder: 'desc'
  });

  // Modal dialog states
  readonly showMemoryModal = signal<boolean>(false);
  readonly memoryToEdit = signal<Memory | null>(null);
  readonly showCategoryModal = signal<boolean>(false);
  readonly showAuthModal = signal<boolean>(false);
  readonly showSupabaseModal = signal<boolean>(false);
  readonly activeLightboxImage = signal<string | null>(null);

  // Toast / notification banner
  readonly toastMessage = signal<string | null>(null);

  /**
   * Filtered and sorted memories
   */
  readonly filteredMemories = computed<Memory[]>(() => {
    const all = this.supabase.memories();
    const f = this.filters();

    return all
      .filter(memory => {
        // Free text search
        if (f.searchTerm.trim()) {
          const query = f.searchTerm.trim().toLowerCase();
          const matchTitle = (memory.title || '').toLowerCase().includes(query);
          const matchContent = (memory.content || '').toLowerCase().includes(query);
          if (!matchTitle && !matchContent) return false;
        }

        // Category filter
        if (f.selectedCategoryId !== null && f.selectedCategoryId !== undefined && String(memory.category_id) !== String(f.selectedCategoryId)) {
          return false;
        }

        // Mood filter
        if (f.selectedMood && (memory.mood || '').toLowerCase() !== f.selectedMood.toLowerCase()) {
          return false;
        }

        // Year filter
        if (f.selectedYear !== null) {
          const memYear = new Date(memory.memory_date).getFullYear();
          if (memYear !== f.selectedYear) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.memory_date).getTime();
        const dateB = new Date(b.memory_date).getTime();
        return f.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  });

  /**
   * Group memories into Month-by-Month sections
   */
  readonly monthGroups = computed<MonthGroup[]>(() => {
    const list = this.filteredMemories();
    const groupMap = new Map<string, { label: string; year: number; monthIndex: number; memories: Memory[] }>();

    for (const memory of list) {
      if (!memory.memory_date) continue;
      const [yearStr, monthStr] = memory.memory_date.split('-');
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1;
      const key = `${yearStr}-${monthStr}`;

      const dateObj = new Date(year, monthIndex, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          label,
          year,
          monthIndex,
          memories: []
        });
      }
      groupMap.get(key)!.memories.push(memory);
    }

    const sortOrder = this.filters().sortOrder;
    const sortedGroups = Array.from(groupMap.entries()).map(([monthKey, val]) => ({
      monthKey,
      monthLabel: val.label,
      year: val.year,
      monthIndex: val.monthIndex,
      memories: val.memories
    }));

    sortedGroups.sort((a, b) => {
      const aVal = a.year * 100 + a.monthIndex;
      const bVal = b.year * 100 + b.monthIndex;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return sortedGroups;
  });

  // Action triggers
  openCreateMemory(): void {
    this.memoryToEdit.set(null);
    this.showMemoryModal.set(true);
  }

  onEditMemory(memory: Memory): void {
    this.memoryToEdit.set(memory);
    this.showMemoryModal.set(true);
  }

  async onDeleteMemory(memory: Memory): Promise<void> {
    const res = await this.supabase.deleteMemory(memory.id);
    if (res.success) {
      this.showToast(`Deleted memory "${memory.title}"`);
    }
  }

  onMemorySaved(): void {
    this.showToast('Memory saved to archive.');
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 3500);
  }
}
