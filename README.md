# 🎬 Movie Tracker & Watchlist

A local-first movie & TV tracker built with **Next.js (App Router)** and **TypeScript** using the TMDB API.  
It helps you keep a personal watchlist, mark watched titles, and export your library fast.

No authentication.  
No backend.  
Your data stays in your browser.

---

## 🚀 Features

- 🔎 Search movies & TV (TMDB API)
- ➕ Add to watchlist
- 👁 Watched / Watchlist status
- ⭐ Rating (1–10)
- 🎲 Random suggestion from watched list
- 📤 Export (JSON & CSV)
- 📥 Import JSON (duplicate-safe)
- 💾 LocalStorage persistence
- 📱 Responsive UI

---

## 🛠️ Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TMDB API
- Context API
- CSS Modules

---

## 📦 Setup & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Keremunce/random-film-suggester.git
   cd random-film-suggester
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Add environment variable:**
   Create `.env.local`:
   ```bash
   TMDB_API_KEY=your_key_here
   ```
4. **Run the app:**
   ```bash
   npm run dev
   ```

## ⚠️ Notes

- Data is stored locally in the browser (single device only).
- TMDB API key is required for search and new releases.
