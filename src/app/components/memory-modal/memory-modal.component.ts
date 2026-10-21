import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Memory, AVAILABLE_MOODS, MoodConfig } from '../../models/memory.model';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-memory-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title-wrap">
            <h2 class="modal-title">
              {{ isEditing() ? 'Edit Memory' : 'Log a New Memory' }}
            </h2>
            <p class="modal-subtitle">
              {{ isEditing() ? 'Update the details and reflections of this memory.' : 'Capture a moment in time to look back onto in the future.' }}
            </p>
          </div>
          <button type="button" class="close-btn" (click)="close.emit()" title="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="onSubmit()" class="modal-body">
          @if (errorMessage()) {
            <div class="form-error-banner">
              {{ errorMessage() }}
            </div>
          }

          <!-- Memory Title -->
          <div class="form-group">
            <label class="form-label" for="mem-title">Title *</label>
            <input 
              id="mem-title"
              type="text" 
              class="form-input" 
              placeholder="e.g., Morning coffee by the garden window"
              [(ngModel)]="title" 
              name="title" 
              required
              autofocus
            />
          </div>

          <!-- Date & Category Row -->
          <div class="form-row">
            <!-- Date -->
            <div class="form-group flex-1">
              <label class="form-label" for="mem-date">Date of Memory *</label>
              <input 
                id="mem-date"
                type="date" 
                class="form-input" 
                [(ngModel)]="memoryDate" 
                name="memoryDate" 
                required
              />
            </div>

            <!-- Category -->
            <div class="form-group flex-1">
              <div class="label-with-action">
                <label class="form-label" for="mem-cat">Category *</label>
                <button type="button" class="link-action" (click)="openCategoryModal.emit()">
                  + New
                </button>
              </div>
              <select 
                id="mem-cat"
                class="form-select" 
                [(ngModel)]="categoryId" 
                name="categoryId" 
                required>
                <option value="" disabled>Select category</option>
                @for (cat of supabase.categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Mood Selector -->
          <div class="form-group">
            <label class="form-label">How did it feel? (Mood) *</label>
            <div class="mood-selector-grid">
              @for (mood of availableMoods; track mood.value) {
                <button 
                  type="button"
                  class="mood-pill-btn"
                  [class.selected]="selectedMood === mood.value"
                  [style.--pill-bg]="mood.bgColor"
                  [style.--pill-color]="mood.textColor"
                  [style.--pill-border]="mood.borderColor"
                  (click)="selectedMood = mood.value">
                  <span class="mood-name">{{ mood.name }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Content / Reflection -->
          <div class="form-group">
            <label class="form-label" for="mem-content">Story & Reflections *</label>
            <textarea 
              id="mem-content"
              class="form-textarea" 
              rows="4"
              placeholder="What happened? What were you thinking, feeling, or noticing? Who was there?..."
              [(ngModel)]="content" 
              name="content"
              required>
            </textarea>
          </div>

          <!-- Photo Section -->
          <div class="form-group">
            <label class="form-label">Photo (Optional)</label>

            @if (photoPreview()) {
              <div class="photo-preview-wrap">
                <img [src]="photoPreview()" alt="Attached preview" class="preview-img" />
                <button type="button" class="remove-photo-btn" (click)="removePhoto()" title="Remove photo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            } @else {
              <div class="photo-dropzone" (click)="fileInput.click()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
                <div class="dropzone-text">
                  <span class="dropzone-highlight">Click to upload an image</span> or drag here
                </div>
                <div class="dropzone-hint">PNG, JPG, WEBP supported</div>
                <input 
                  #fileInput 
                  type="file" 
                  accept="image/*" 
                  class="hidden-file-input" 
                  (change)="onFileSelected($event)"
                />
              </div>

              <!-- Or paste Image URL toggle -->
              <div class="url-fallback-row">
                <button type="button" class="btn-link" (click)="showUrlInput.set(!showUrlInput())">
                  {{ showUrlInput() ? 'Hide URL input' : 'Or use an image URL instead' }}
                </button>
                @if (showUrlInput()) {
                  <input 
                    type="url" 
                    class="form-input url-input" 
                    placeholder="https://example.com/photo.jpg" 
                    [(ngModel)]="photoUrl" 
                    name="photoUrl"
                    (input)="onUrlInput()"
                  />
                }
              </div>
            }
          </div>

          <!-- Actions Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close.emit()">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="isSubmitting() || !isValid()">
              @if (isSubmitting()) {
                <span>Saving...</span>
              } @else {
                <span>{{ isEditing() ? 'Save Changes' : 'Log Memory' }}</span>
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
      transition: all var(--transition-fast);
    }
    .close-btn:hover {
      color: var(--text-main);
      background-color: var(--bg-surface-subtle);
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 14px;
    }
    .flex-1 {
      flex: 1;
    }

    .label-with-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .link-action {
      font-size: 12px;
      color: var(--accent-earth);
      font-weight: 500;
    }
    .link-action:hover {
      text-decoration: underline;
    }

    .mood-selector-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .mood-pill-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      border-radius: var(--radius-md);
      background-color: var(--bg-surface-subtle);
      border: 1px solid var(--border-subtle);
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
      text-align: center;
      justify-content: center;
    }
    .mood-pill-btn:hover {
      border-color: var(--border-strong);
      background-color: var(--bg-surface-hover);
    }
    .mood-pill-btn.selected {
      background-color: var(--pill-bg);
      color: var(--pill-color);
      border-color: var(--pill-border);
      font-weight: 600;
    }

    .photo-dropzone {
      border: 2px dashed var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 24px 16px;
      text-align: center;
      cursor: pointer;
      color: var(--text-muted);
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      background-color: var(--bg-page);
    }
    .photo-dropzone:hover {
      border-color: var(--border-strong);
      color: var(--text-secondary);
      background-color: var(--bg-surface-subtle);
    }

    .dropzone-text {
      font-size: 13px;
      color: var(--text-secondary);
    }
    .dropzone-highlight {
      font-weight: 600;
      color: var(--text-main);
      text-decoration: underline;
    }

    .dropzone-hint {
      font-size: 11px;
      color: var(--text-muted);
    }

    .hidden-file-input {
      display: none;
    }

    .photo-preview-wrap {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      max-height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #000;
    }

    .preview-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
    }

    .remove-photo-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(28, 25, 23, 0.8);
      color: white;
      padding: 6px 10px;
      border-radius: var(--radius-full);
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      backdrop-filter: blur(4px);
      transition: background-color var(--transition-fast);
    }
    .remove-photo-btn:hover {
      background: var(--danger-color);
    }

    .url-fallback-row {
      margin-top: 8px;
    }

    .btn-link {
      font-size: 12px;
      color: var(--text-muted);
      text-decoration: underline;
    }
    .btn-link:hover {
      color: var(--text-main);
    }

    .url-input {
      margin-top: 8px;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
      margin-top: 8px;
    }

    .form-error-banner {
      background-color: var(--danger-soft);
      color: var(--danger-color);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }

    @media (max-width: 540px) {
      .modal-card {
        max-height: 94vh;
        border-radius: var(--radius-md);
      }
      .modal-header {
        padding: 16px;
      }
      .modal-body {
        padding: 16px;
        gap: 12px;
      }
      .form-row {
        flex-direction: column;
        gap: 12px;
      }
      .mood-selector-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
      }
      .modal-footer {
        padding-top: 12px;
      }
    }
  `]
})
export class MemoryModalComponent implements OnInit {
  readonly supabase = inject(SupabaseService);

  readonly memoryToEdit = input<Memory | null>(null);
  readonly close = output<void>();
  readonly saved = output<void>();
  readonly openCategoryModal = output<void>();

  readonly availableMoods: MoodConfig[] = AVAILABLE_MOODS;

  title = '';
  memoryDate = '';
  categoryId: number | string = '';
  selectedMood = 'happy';
  content = '';
  photoUrl = '';
  photoPreview = signal<string | null>(null);
  selectedFile: File | null = null;

  showUrlInput = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  isEditing(): boolean {
    return !!this.memoryToEdit();
  }

  ngOnInit(): void {
    const memory = this.memoryToEdit();
    if (memory) {
      this.title = memory.title;
      this.memoryDate = memory.memory_date;
      this.categoryId = memory.category_id ?? '';
      this.selectedMood = (memory.mood || 'happy').toLowerCase();
      this.content = memory.content;
      this.photoPreview.set(memory.photo_path || null);
    } else {
      // Default to today's date in YYYY-MM-DD
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      this.memoryDate = `${yyyy}-${mm}-${dd}`;

      // Default category if available
      const cats = this.supabase.categories();
      if (cats.length > 0) {
        this.categoryId = cats[0].id;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onUrlInput(): void {
    if (this.photoUrl.trim()) {
      this.photoPreview.set(this.photoUrl.trim());
      this.selectedFile = null;
    }
  }

  removePhoto(): void {
    this.photoPreview.set(null);
    this.selectedFile = null;
    this.photoUrl = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  isValid(): boolean {
    return !!this.title.trim() && !!this.memoryDate && !!this.categoryId && !!this.content.trim();
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      let finalPhotoPath = this.photoPreview();

      // If user selected a new file, upload through SupabaseService
      if (this.selectedFile) {
        finalPhotoPath = await this.supabase.uploadPhoto(this.selectedFile);
      }

      if (this.isEditing()) {
        const memory = this.memoryToEdit()!;
        const res = await this.supabase.updateMemory(memory.id, {
          title: this.title.trim(),
          memory_date: this.memoryDate,
          category_id: this.categoryId,
          mood: this.selectedMood,
          content: this.content.trim(),
          photo_path: finalPhotoPath
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to update memory');
        }
      } else {
        const res = await this.supabase.createMemory({
          title: this.title.trim(),
          memory_date: this.memoryDate,
          category_id: this.categoryId,
          mood: this.selectedMood,
          content: this.content.trim(),
          photo_path: finalPhotoPath
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to create memory');
        }
      }

      this.saved.emit();
      this.close.emit();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'An error occurred while saving the memory.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
