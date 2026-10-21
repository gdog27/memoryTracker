# Memora - Your personal memory tracker

**Memora** is our memory tacker app. With Memora, you can track and collect your memories, so they never go lost!

---

## Features of Memora

- **Personal Memory Timeline**:
  - View your memories on a timeline


- **Memory Logging & Editing**:
  - Add memories with: **Title**, **Date of Memory**, **Category**, **Mood**, **Story / Reflections**, and **Photos**.
  - Upload photos of your favorite memories


- **Statistics on your memories**:
  - View how many memories you have tracked so far!

- **Search & Filtering**:
  - Search and filter your memories, so you can find them easily!

- **Category Management**:
  - Create custom categories

- **Supabase Authentication & Database Integration**:
  - We use Supabase for the authentication. you sign up using your email, and create a password. We have decided to disable the email verification, to avoid potential errors.


---

## Database Schema (Supabase)

- How we've made the database. We created a SQL table, with two other tables. The first table, is for the user, the second table is for the memories, and the third table is for the photos. We use Supabase, where we created a SQL table, and the used SQL to add the tables and contents