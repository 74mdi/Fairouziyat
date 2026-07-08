import type { MetadataRoute } from "next";
import { getAllAlbums } from "@/lib/db";
import { Pool } from "pg";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fairouziyat.vercel.app";

async function getAllSongIds(): Promise<number[]> {
  const pool = new Pool({
    connectionString: process.env.FAIROUZIYAT_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    const { rows } = await pool.query<{ id: number }>("SELECT id FROM songs ORDER BY id");
    return rows.map((r) => r.id);
  } finally {
    await pool.end();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [albums, songIds] = await Promise.all([getAllAlbums(), getAllSongIds()]);

  const albumEntries: MetadataRoute.Sitemap = albums.map((a) => ({
    url: `${SITE_URL}/albums/${a.id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const songEntries: MetadataRoute.Sitemap = songIds.map((id) => ({
    url: `${SITE_URL}/songs/${id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
    ...albumEntries,
    ...songEntries,
  ];
}
