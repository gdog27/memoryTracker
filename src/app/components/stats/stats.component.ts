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
      margin-top: 16px;
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    /* Clean, non-interactive metric card with subtle rounding, NO orange line, and NO hover jump */
    .stat-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      /* Static and grounded: NO hover effects, NO translateY, NO box-shadow growth */
    }

    /* Highlight card has no orange border line - shares the clean border with all stat cards */
    .stat-card-highlight {
      background-color: var(--bg-surface);
    }

    .stat-value {
      font-size: 34px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 6px;
      font-variant-numeric: tabular-nums;
    }

    .highlight-value {
      color: var(--accent-vibrant);
    }

    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    @media (max-width: 680px) {
      .stats-grid {
        gap: 8px;
      }
      .stat-card {
        padding: 12px 10px;
      }
      .stat-value {
        font-size: 26px;
      }
      .stat-label {
        font-size: 10.5px;
      }
    }
  `]
})
export class StatsComponent {
  readonly supabase = inject(SupabaseService);
}
