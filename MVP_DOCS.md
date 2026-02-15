# 🎬 Media Tracker - Local-First Cinema & TV Series Tracker

A minimal, weekend MVP that lets you own your watch history. No authentication, no backend, no database—pure local-first with full export capabilities.

## Features

✅ **Search & Discover**
- Search movies and TV series from TMDB API
- Filter out persons, keep only media
- Clean, mobile-first search UI

✅ **Personal Library**
- Add movies/series to your watchlist
- Mark items as "Watched" or "Watchlist"
- Rate 1-5 stars
- View with filters:
  - All / Watched / Watchlist
  - Movies only / Series only

✅ **Data Ownership**
- All data stored in localStorage
- Export to JSON or CSV
  - All items or by type (movies/series)
- Import JSON backups
  - Automatic duplicate handling by TMDB ID
- Clear all data (with confirmation)

✅ **User Experience**
- Mobile-first responsive design
- No external dependencies (no Redux, no Auth)
- Lightweight, fast
- Clean functional UI

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State**: React Context + localStorage
- **API**: TMDB API (search/multi endpoint)
- **Data Format**: LocalStorage JSON

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── search/route.ts          # TMDB search endpoint
│   ├── context/
│   │   └── MovieContext.tsx         # Global media state
│   ├── layout.tsx                   # Root layout with Navigation
│   ├── page.tsx                     # Home (stats & CTA)
│   ├── search/page.tsx              # Search & add items
│   ├── list/page.tsx                # View & manage library
│   └── settings/page.tsx            # Export/Import/Stats
├── components/
│   ├── Navigation/                  # Top nav with links
│   ├── StarRating/                  # Reusable 5-star component
│   ├── MediaCard/                   # Item card in My List
│   └── SearchResult/                # Result card in Search
└── utils/
    ├── storage.ts                   # localStorage helpers
    ├── export.ts                    # JSON & CSV export
    ├── import.ts                    # JSON import validation
    └── filters.ts                   # Status & type filtering
```

## Getting Started

### Prerequisites
- Node.js 18+
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Setup

1. **Clone & install**
   ```bash
   cd random-film-suggester
   npm install
   ```

2. **Set environment**
   ```bash
   # .env.local
   TMDB_API_KEY=your_api_key_here
   ```

3. **Run dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Data Model

### MediaItem
```typescript
{
  id: string;              // local uuid
  tmdbId: number;          // TMDB identifier
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;  // ISO date
  status: "watched" | "watchlist";
  rating: number | null;   // 1-5 or null
  addedAt: string;         // ISO timestamp
}
```

## Key Decisions (Anti-Over-Engineering)

❌ **NOT included** (by design):
- Authentication / user accounts
- Backend API
- Database
- External state management (Redux)
- UI library (Tailwind preset exists but unused)
- Complex filtering logic

✅ **Focused on**:
- Speed to MVP (one weekend)
- User data ownership
- Clean, readable code
- Mobile-first styling
- Practical features (export/import)

## Usage

### Search & Add
1. Click "🔍 Search Movies & Series"
2. Type movie/series name
3. Click "+ Add" on results
4. Items go to "Watchlist" by default

### Manage List
1. Click "📋 View My List"
2. Toggle status (Watched ↔ Watchlist)
3. Click stars to rate
4. Click ✕ to remove

### Export Data
1. Go to "⚙️ Settings"
2. Choose format (JSON/CSV)
3. Choose scope (All/Movies/Series)
4. Browser downloads file

### Import Data
1. Go to "⚙️ Settings"
2. Click upload box or drag-drop JSON file
3. Duplicates auto-skipped
4. Existing items preserved

## Browser Storage

Data persists in localStorage under `rfs_media_items`. Clear to reset.

## Future Ideas (not in scope)

- Ratings aggregation from TMDB
- IMDb/Rotten Tomatoes links
- Watch date tracking
- Collections/groups
- Sharing features
- Sync across devices

## License

MIT
