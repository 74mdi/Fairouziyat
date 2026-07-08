import { Pool } from "pg";
import { unstable_cache } from "next/cache";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.FAIROUZIYAT_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}

export interface AlbumRow {
  id: number;
  name: string;
  cover_local: string | null;
  song_count: number;
}

export interface SongRow {
  id: number;
  album_id: number;
  title: string;
  url: string;
  track_number: number | null;
  lyricist: string | null;
  composer: string | null;
  maqam: string | null;
  lyrics: string | null;
  og_snippet: string | null;
  audio_local: string | null;
  audio_opus: string | null;
  audio_m4a: string | null;
}

export interface SongDetailRow extends SongRow {
  album_name: string;
  cover_local: string | null;
  prev_id: number | null;
  next_id: number | null;
}

export interface SearchSongRow {
  id: number;
  title: string;
  lyricist: string | null;
  composer: string | null;
  album_name: string;
  album_id: number;
}

export const getAllAlbums = unstable_cache(
  async (): Promise<AlbumRow[]> => {
    const { rows } = await getPool().query<AlbumRow>(`
      SELECT id, name, cover_local,
        (SELECT COUNT(*)::int FROM songs WHERE album_id = albums.id) AS song_count
      FROM albums ORDER BY name
    `);
    return rows;
  },
  ["all-albums"],
  { revalidate: 86400, tags: ["albums"] }
);

export const getAlbumById = unstable_cache(
  async (id: number): Promise<{ album: AlbumRow; songs: SongRow[] } | null> => {
    const albumRes = await getPool().query<AlbumRow>(
      `SELECT id, name, cover_local,
        (SELECT COUNT(*)::int FROM songs WHERE album_id = albums.id) AS song_count
       FROM albums WHERE id = $1`,
      [id]
    );
    if (!albumRes.rows[0]) return null;
    const songsRes = await getPool().query<SongRow>(
      `SELECT * FROM songs WHERE album_id = $1 ORDER BY track_number`,
      [id]
    );
    return { album: albumRes.rows[0], songs: songsRes.rows };
  },
  ["album-by-id"],
  { revalidate: 86400, tags: ["albums"] }
);

export const getSongById = unstable_cache(
  async (id: number): Promise<SongDetailRow | null> => {
    const { rows } = await getPool().query<SongDetailRow>(
      `SELECT s.*, a.name AS album_name, a.cover_local AS cover_local,
        (SELECT id FROM songs WHERE album_id = s.album_id AND track_number = s.track_number - 1 LIMIT 1) AS prev_id,
        (SELECT id FROM songs WHERE album_id = s.album_id AND track_number = s.track_number + 1 LIMIT 1) AS next_id
       FROM songs s JOIN albums a ON s.album_id = a.id WHERE s.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },
  ["song-by-id"],
  { revalidate: 86400, tags: ["songs"] }
);

export async function searchSongsAndAlbums(query: string) {
  const like = `%${query}%`;
  const [songsRes, albumsRes] = await Promise.all([
    getPool().query<SearchSongRow>(
      `SELECT s.id, s.title, s.lyricist, s.composer, a.name AS album_name, a.id AS album_id
       FROM songs s JOIN albums a ON s.album_id = a.id
       WHERE s.title ILIKE $1 OR s.lyrics ILIKE $1 OR s.composer ILIKE $1 OR s.lyricist ILIKE $1
       LIMIT 50`,
      [like]
    ),
    getPool().query<AlbumRow>(
      `SELECT id, name, cover_local,
        (SELECT COUNT(*)::int FROM songs WHERE album_id = albums.id) AS song_count
       FROM albums WHERE name ILIKE $1 LIMIT 20`,
      [like]
    ),
  ]);
  return { songs: songsRes.rows, albums: albumsRes.rows };
}

export const getLibraryStats = unstable_cache(
  async () => {
    const { rows } = await getPool().query<{
      total_albums: number; total_songs: number;
      total_composers: number; total_maqamat: number;
    }>(`SELECT
      (SELECT COUNT(*)::int FROM albums) AS total_albums,
      (SELECT COUNT(*)::int FROM songs) AS total_songs,
      (SELECT COUNT(DISTINCT composer)::int FROM songs WHERE composer IS NOT NULL AND composer <> '') AS total_composers,
      (SELECT COUNT(DISTINCT maqam)::int FROM songs WHERE maqam IS NOT NULL AND maqam <> '') AS total_maqamat
    `);
    return rows[0];
  },
  ["library-stats"],
  { revalidate: 86400, tags: ["stats"] }
);
