export interface Memory {
  id: number | string;
  user_id: string;
  title: string;
  memory_date: string; // ISO date format: YYYY-MM-DD
  category_id?: number | string | null;
  mood: string;
  content: string;
  photo_path?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Category {
  id: number | string;
  name: string;
  user_id?: string;
  memory_count?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  full_name?: string;
}

export interface MoodConfig {
  name: string;
  value: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const AVAILABLE_MOODS: MoodConfig[] = [
  { name: 'Happy', value: 'happy', description: 'Bright, joyful, celebratory', bgColor: '#FEF3C7', textColor: '#B45309', borderColor: '#FCD34D' },
  { name: 'Calm', value: 'calm', description: 'Peaceful, centered, quiet', bgColor: '#D1FAE5', textColor: '#047857', borderColor: '#6EE7B7' },
  { name: 'Grateful', value: 'grateful', description: 'Appreciative, warm, grounded', bgColor: '#FFEDD5', textColor: '#C2410C', borderColor: '#FDBA74' },
  { name: 'Excited', value: 'excited', description: 'Energetic, eager, proud', bgColor: '#FFE4E6', textColor: '#BE123C', borderColor: '#FDA4AF' },
  { name: 'Neutral', value: 'neutral', description: 'Balanced, observational, steady', bgColor: '#E0F2FE', textColor: '#0369A1', borderColor: '#7DD3FC' },
  { name: 'Anxious', value: 'anxious', description: 'Nervous, unsettled, reflective', bgColor: '#EDE9FE', textColor: '#6D28D9', borderColor: '#C4B5FD' },
  { name: 'Sad', value: 'sad', description: 'Bittersweet, poignant, longing', bgColor: '#F1F5F9', textColor: '#334155', borderColor: '#CBD5E1' },
  { name: 'Angry', value: 'angry', description: 'Frustrated, passionate, heated', bgColor: '#FEE2E2', textColor: '#B91C1C', borderColor: '#FCA5A5' }
];

export interface MemoryFilters {
  searchTerm: string;
  selectedCategoryId: number | string | null;
  selectedMood: string | null;
  selectedYear: number | null;
  sortOrder: 'desc' | 'asc'; // date ordering
}

export interface MonthGroup {
  monthKey: string; // e.g. "2026-10"
  monthLabel: string; // e.g. "October 2026"
  year: number;
  monthIndex: number;
  memories: Memory[];
}

export interface MemoryStats {
  memoriesThisYear: number;
  totalMemories: number;
  totalCategories: number;
  topMood: string;
  oldestDate?: string;
  newestDate?: string;
}
