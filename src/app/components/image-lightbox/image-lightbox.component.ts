import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lightbox-overlay" (click)="close.emit()">
      <button type="button" class="lightbox-close" (click)="close.emit()" title="Close photo view">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="lightbox-content" (click)="$event.stopPropagation()">
        <img [src]="imageUrl()" alt="Expanded memory photograph" class="lightbox-image" />
      </div>
    </div>
  `,
  styles: [`
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.94);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 24px;
      animation: fadeIn 120ms ease forwards;
    }

    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 20px;
      color: #FFFFFF;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-fast), border-color var(--transition-fast);
      cursor: pointer;
    }
    .lightbox-close:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: #FFFFFF;
    }

    .lightbox-content {
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: zoomIn 160ms ease-out forwards;
    }

    .lightbox-image {
      max-width: 100%;
      max-height: 85vh;
      object-fit: contain;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes zoomIn {
      from { transform: scale(0.98); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ImageLightboxComponent {
  readonly imageUrl = input.required<string>();
  readonly close = output<void>();
}
