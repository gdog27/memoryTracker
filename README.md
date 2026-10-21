# Memora — Personal Memory Archive

**Memora** is a single-page memory tracking application built with Angular and designed for thoughtful personal archiving, reflection, and gratitude.

---

## Features

- **Personal Memory Timeline**:
  - Month-by-month chronological stream of your memories.
  - Visual timeline spine connecting past moments.
  - Formatted dates, mood badges, categories, rich narrative text, and optional photos.
  - Fullscreen photo lightbox for detailed photo viewing.

- **Memory Logging & Editing**:
  - Add memories with: **Title**, **Date of Memory**, **Category**, **Mood**, **Story / Reflections**, and **Photos**.
  - Photo upload support: local file upload (with preview and Supabase storage upload / data URL fallback) or image URL.
  - Full edit and delete capabilities for any recorded memory.

- **Statistics on the Front**:
  - Highlights the count of **memories logged this year**.
  - Displays total archive count, categories count, and most frequent emotional mood.

- **Search & Filtering**:
  - Instant free-text search across titles and reflection text.
  - Category pill filter with memory count per category.
  - Mood filter dropdown (Joyful, Peaceful, Grateful, Adventurous, Reflective, Cozy, Excited, Melancholy).
  - Sort order toggle (Newest first vs. Oldest first).

- **Category Management**:
  - Create custom categories on the fly with live count of associated memories.

- **Supabase Authentication & Database Integration**:
  - Supabase Auth: Sign In & Sign Up with Name, Email, and Password.
  - Connected database tables: `memories`, `categories`, and `profiles`.
  - In-app **Supabase Connection** modal to input your Project URL and Anon API Key with instant status indicator.
  - Fully functional offline/local archive fallback when Supabase credentials are not yet entered.

- **Human-Centric Design**:
  - Built with the **Inter** font.
  - Clean, warm paper palette (`#FAF8F5`) with crisp stone borders, natural mood badges, and subtle micro-transitions.
  - Avoids artificial AI gradients and uniform SaaS tropes.

---

## Database Schema (Supabase)

If you wish to run the database table setup in Supabase SQL editor:

```sql
-- 1. Categories Table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Memories Table
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  memory_date date not null,
  category_id uuid references categories(id) on delete set null,
  mood text not null,
  content text not null,
  photo_path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Storage Bucket (Optional for photo uploads)
insert into storage.buckets (id, name, public) 
values ('memory-photos', 'memory-photos', true)
on conflict (id) do nothing;
```

---

## Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
```
Open [http://localhost:4200/](http://localhost:4200/) in your browser.

### 3. Connect to Supabase
1. Click the **"Local Archive"** status button in the top navigation bar.
2. Enter your **Supabase Project URL** and **Anon / Public API Key**.
3. Click **"Save & Connect"**. Memora will immediately authenticate and sync with your live Supabase database!
