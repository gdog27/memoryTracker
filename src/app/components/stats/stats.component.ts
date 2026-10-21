import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="stats-section">
      <div class="stats-grid">
        <!-- Memories Logged This Year -->
        <div class="stat-card stat-card-highlight">
          <div class="stat-value highlight-value">{{ supabase.stats().memoriesThisYear }}</div>
          <div class="stat-label">Logged this year</div>
        </div>

        <!-- Total Memories -->
        <div class="stat-card">
          <div class="stat-value">{{ supabase.stats().totalMemories }}</div>
          <div class="stat-label">Total in Archive</div>
        </div>

        <!-- Categories -->
        <div class="stat-card">
          <div class="stat-value">{{ supabase.stats().totalCategories }}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stats-section {
      margin-top: 18px;
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .stat-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .stat-card:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .stat-card-highlight {
      background-color: var(--accent-vibrant-soft);
      border-color: var(--accent-vibrant-border);
    }
    .stat-card-highlight:hover {
      border-color: var(--accent-vibrant);
    }

    .stat-value {
      font-size: 40px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 6px;
    }

    .highlight-value {
      color: var(--accent-vibrant);
    }

    .stat-label {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    @media (max-width: 680px) {
      .stats-grid {
        gap: 10px;
      }
      .stat-card {
        padding: 14px 12px;
      }
      .stat-value {
        font-size: 30px;
      }
      .stat-label {
        font-size: 12px;
      }
    }

    @media (max-width: 440px) {
      .stat-card {
        padding: 12px 10px;
      }
      .stat-value {
        font-size: 26px;
      }
      .stat-label {
        font-size: 11px;
      }
    }
  `]
})
export class StatsComponent {
  readonly supabase = inject(SupabaseService);
}
