import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Memory, Category, UserProfile, MemoryStats } from '../models/memory.model';

const STORAGE_KEYS = {
  SUPABASE_URL: 'memora_supabase_url',
  SUPABASE_KEY: 'memora_supabase_key',
  LOCAL_MEMORIES: 'memora_local_memories_v1',
  LOCAL_CATEGORIES: 'memora_local_categories_v1',
  LOCAL_USER: 'memora_local_user_v1'
};

// Default Supabase credentials provided by user
export const DEFAULT_SUPABASE_URL = 'https://ozhdubtwrmnpllybcrey.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_-gHk3gO4YCGamKkDwytsNA_-TFKaHp-';

export function sanitizeSupabaseUrl(url: string): string {
  let cleaned = (url || '').trim();
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

const DEFAULT_STARTER_CATEGORIES = [
  'Quiet Moments',
  'Travel & Journeys',
  'Family & Friends',
  'Milestones & Growth',
  'Art & Creativity'
];

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client: SupabaseClient | null = null;

  // Reactive state signals
  readonly isConnectedToSupabase = signal<boolean>(false);
  readonly supabaseUrl = signal<string>(DEFAULT_SUPABASE_URL);
  readonly supabaseAnonKey = signal<string>(DEFAULT_SUPABASE_KEY);
  
  readonly currentUser = signal<UserProfile | null>(null);
  readonly memories = signal<Memory[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly statusMessage = signal<string | null>(null);

  // Computed stats
  readonly stats = computed<MemoryStats>(() => {
    const list = this.memories();
    const currentYear = new Date().getFullYear();
    const thisYearCount = list.filter(m => {
      if (!m.memory_date) return false;
      const year = new Date(m.memory_date).getFullYear();
      return year === currentYear;
    }).length;

    return {
      memoriesThisYear: thisYearCount,
      totalMemories: list.length,
      totalCategories: this.categories().length,
      topMood: 'None'
    };
  });

  constructor() {
    this.initService();
  }

  private initService(): void {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
    const savedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || DEFAULT_SUPABASE_KEY;

    this.supabaseUrl.set(savedUrl);
    this.supabaseAnonKey.set(savedKey);

    if (savedUrl && savedKey) {
      this.initSupabaseClient(savedUrl, savedKey);
    }
  }

  /**
   * Initializes real Supabase Client with credentials
   */
  async initSupabaseClient(rawUrl: string, anonKey: string): Promise<boolean> {
    const url = sanitizeSupabaseUrl(rawUrl);

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const client = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });

      this.client = client;
      this.supabaseUrl.set(url);
      this.supabaseAnonKey.set(anonKey);
      localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url);
      localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, anonKey);

      // Check current session
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      if (sessionError) {
        console.warn('Supabase session notice:', sessionError);
      }

      if (session?.user) {
        this.setUserFromSupabase(session.user);
      } else {
        this.currentUser.set(null);
      }

      // Listen for auth state changes
      client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          this.setUserFromSupabase(session.user);
        } else {
          this.currentUser.set(null);
        }
        this.loadData();
      });

      this.isConnectedToSupabase.set(true);
      await this.loadData();
      this.statusMessage.set('Connected to Supabase database.');
      return true;
    } catch (err: any) {
      console.error('Failed to initialize Supabase client:', err);
      this.errorMessage.set(err.message || 'Could not connect to Supabase.');
      this.isConnectedToSupabase.set(false);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  disconnectSupabase(): void {
    this.client = null;
    this.isConnectedToSupabase.set(false);
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
    this.categories.set([]);
    this.memories.set([]);
    this.currentUser.set(null);
    this.statusMessage.set('Supabase disconnected.');
  }

  private setUserFromSupabase(user: User): void {
    const displayName = user.user_metadata?.['display_name'] || 
                        user.user_metadata?.['full_name'] || 
                        user.email?.split('@')[0] || 
                        'User';

    this.currentUser.set({
      id: user.id,
      email: user.email || '',
      display_name: displayName
    });
  }

  // ===================== AUTHENTICATION =====================

  async signUp(email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (!this.client) {
        throw new Error('Supabase client is not connected.');
      }

      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      });

      if (error) throw error;

      if (data.user) {
        this.setUserFromSupabase(data.user);

        // Attempt to insert/upsert into profiles table: id (uuid), display_name (varchar)
        try {
          await this.client.from('profiles').upsert([
            {
              id: data.user.id,
              display_name: displayName
            }
          ]);
        } catch (profileErr) {
          console.warn('Profile sync note:', profileErr);
        }

        await this.loadData();
      }

      return { success: true };
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Sign up failed');
      return { success: false, error: err.message || 'Sign up failed' };
    } finally {
      this.isLoading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (!this.client) {
        throw new Error('Supabase client is not connected.');
      }

      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        this.setUserFromSupabase(data.user);
        await this.loadData();
        return { success: true };
      }
      return { success: false, error: 'Sign in succeeded but user was not found.' };
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Sign in failed');
      return { success: false, error: err.message || 'Sign in failed' };
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut(): Promise<void> {
    this.isLoading.set(true);
    try {
      if (this.client) {
        await this.client.auth.signOut();
      }
      this.currentUser.set(null);
      this.memories.set([]);
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ===================== DATA LOAD =====================

  async loadData(): Promise<void> {
    if (!this.client) return;

    try {
      this.isLoading.set(true);

      // 1. Fetch categories from table "categories" (id int8, name varchar)
      const { data: catData, error: catError } = await this.client
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (catError) {
        console.warn('Categories query notice:', catError.message);
      } else if (catData) {
        this.categories.set(catData);
      }

      // 2. Fetch memories from table "memories"
      const user = this.currentUser();
      let query = this.client.from('memories').select('*');

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data: memData, error: memError } = await query.order('memory_date', { ascending: false });

      if (memError) {
        console.warn('Memories query notice:', memError.message);
      } else if (memData) {
        this.memories.set(memData);
      }
    } catch (err: any) {
      console.error('Error during data load from Supabase:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ===================== MEMORY CRUD =====================

  async createMemory(memoryData: {
    title: string;
    memory_date: string;
    category_id?: number | string | null;
    mood: string;
    content: string;
    photo_path?: string | null;
  }): Promise<{ success: boolean; memory?: Memory; error?: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const user = this.currentUser();
    if (!user?.id) {
      this.isLoading.set(false);
      const errorMsg = 'Please sign in or create an account to log a memory to your database.';
      this.errorMessage.set(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      if (!this.client) throw new Error('Supabase client not connected.');

      // Format category_id: int8 or null
      let catId: number | null = null;
      if (memoryData.category_id !== null && memoryData.category_id !== undefined && memoryData.category_id !== '') {
        const parsed = Number(memoryData.category_id);
        catId = isNaN(parsed) ? null : parsed;
      }

      const payload: any = {
        user_id: user.id,
        title: memoryData.title,
        memory_date: memoryData.memory_date,
        mood: memoryData.mood,
        content: memoryData.content,
        photo_path: memoryData.photo_path || null
      };

      if (catId !== null) {
        payload.category_id = catId;
      }

      const { data, error } = await this.client
        .from('memories')
        .insert([payload])
        .select()
        .single();

      if (error) {
        // If row-level security error, provide clear guidance
        if (error.code === '42501') {
          throw new Error('Supabase Row-Level Security policy blocked this write. Please ensure an INSERT policy exists on table "memories".');
        }
        throw error;
      }

      this.memories.update(list => [data, ...list]);
      return { success: true, memory: data };
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to create memory');
      return { success: false, error: err.message };
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateMemory(id: number | string, updates: Partial<Memory>): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (!this.client) throw new Error('Supabase client not connected.');

      const updatePayload: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.memory_date !== undefined) updatePayload.memory_date = updates.memory_date;
      if (updates.mood !== undefined) updatePayload.mood = updates.mood;
      if (updates.content !== undefined) updatePayload.content = updates.content;
      if (updates.photo_path !== undefined) updatePayload.photo_path = updates.photo_path;
      if (updates.category_id !== undefined) {
        const parsed = Number(updates.category_id);
        updatePayload.category_id = isNaN(parsed) ? null : parsed;
      }

      const { error } = await this.client
        .from('memories')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      this.memories.update(list =>
        list.map(m => m.id === id ? { ...m, ...updatePayload } : m)
      );
      return { success: true };
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to update memory');
      return { success: false, error: err.message };
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteMemory(id: number | string): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (!this.client) throw new Error('Supabase client not connected.');

      const { error } = await this.client
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.memories.update(list => list.filter(m => m.id !== id));
      return { success: true };
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to delete memory');
      return { success: false, error: err.message };
    } finally {
      this.isLoading.set(false);
    }
  }

  // ===================== CATEGORIES =====================

  async createCategory(name: string): Promise<{ success: boolean; category?: Category; error?: string }> {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: 'Category name cannot be empty' };

    if (this.categories().some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: 'A category with this name already exists' };
    }

    this.isLoading.set(true);
    try {
      if (!this.client) throw new Error('Supabase client not connected.');

      const { data, error } = await this.client
        .from('categories')
        .insert([{ name: trimmed }])
        .select()
        .single();

      if (error) {
        if (error.code === '42501') {
          throw new Error('Supabase Row-Level Security blocked category creation. Please ensure an INSERT policy exists on table "categories".');
        }
        throw error;
      }

      this.categories.update(list => [...list, data]);
      return { success: true, category: data };
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to create category');
      return { success: false, error: err.message };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Seeds starter categories if database is currently empty
   */
  async seedStarterCategories(): Promise<void> {
    for (const name of DEFAULT_STARTER_CATEGORIES) {
      await this.createCategory(name);
    }
  }

  // ===================== PHOTO STORAGE =====================

  async uploadPhoto(file: File): Promise<string> {
    if (this.client) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `memories/${fileName}`;

        const { error: uploadError } = await this.client.storage
          .from('memory-photos')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = this.client.storage
            .from('memory-photos')
            .getPublicUrl(filePath);

          if (data?.publicUrl) {
            return data.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Storage bucket upload notice, using data URL fallback:', err);
      }
    }

    // High quality Base64 fallback so photo is always preserved and viewable
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
