# فيروزيّات — Next.js App

A Lebanese music browser for Fairuz songs. Modern minimal design with dark mode, morph animations, and full Arabic RTL support.

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **Framer Motion** — morph animations, page transitions, equalizer
- **PostgreSQL** via `pg` — Neon or any Postgres compatible DB
- **Vanilla CSS** — custom properties, no Tailwind

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from the example:
   ```bash
   cp .env.local.example .env.local
   ```

3. Fill in your secrets in `.env.local`:
   ```
   FAIROUZIYAT_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   AUDIO_DIR=/absolute/path/to/audio/files
   COVERS_DIR=/absolute/path/to/covers/images
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `FAIROUZIYAT_DATABASE_URL` | ✅ | PostgreSQL connection string (Neon, Supabase, or self-hosted) |
| `AUDIO_DIR` | Optional | Absolute path to audio files folder. If not set, playback is disabled. |
| `COVERS_DIR` | Optional | Absolute path to album cover images folder. If not set, fallback initials are shown. |

## Database schema

The app expects two tables:

```sql
CREATE TABLE albums (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cover_local TEXT
);

CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  album_id INTEGER REFERENCES albums(id),
  title TEXT NOT NULL,
  url TEXT,
  track_number INTEGER,
  lyricist TEXT,
  composer TEXT,
  maqam TEXT,
  lyrics TEXT,
  og_snippet TEXT,
  audio_local TEXT,
  audio_opus TEXT,
  audio_m4a TEXT
);
```

## Pages

- `/` — Album grid with search, stats bar, stagger entrance animation
- `/albums/[id]` — Album tracklist with animated equalizer on playing track
- `/songs/[id]` — Song detail with staggered lyrics reveal
- `/search?q=...` — Full-text search across titles, lyrics, composers, album names

## API routes

| Endpoint | Description |
|---|---|
| `GET /api/albums` | All albums |
| `GET /api/albums/[id]` | Album detail + songs |
| `GET /api/songs/[id]` | Song detail with prev/next |
| `GET /api/search?q=` | Full-text search |
| `GET /api/stats` | Library stats |
| `GET /api/audio/[...path]` | Audio streaming with HTTP Range support |
| `GET /api/covers/[...path]` | Cover image serving |

## Deploy

Works out of the box on Vercel. Set your environment variables in the Vercel dashboard.

```bash
npx vercel --prod
```
