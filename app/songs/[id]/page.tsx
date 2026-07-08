import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSongById } from "@/lib/db";
import SongClient from "./SongClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fairouziyat.vercel.app";

function coverUrl(coverLocal: string | null): string | null {
  if (!coverLocal) return null;
  const filename = coverLocal.includes("/") ? coverLocal.split("/").pop()! : coverLocal;
  return `${SITE_URL}/covers/${encodeURIComponent(filename)}`;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const song = await getSongById(Number(id));
  if (!song) return { title: "أغنية غير موجودة | فيروزيّات" };

  const title = `${song.title} — ${song.album_name} | فيروزيّات`;
  const snippetParts: string[] = [];
  if (song.lyricist) snippetParts.push(`كلمات: ${song.lyricist}`);
  if (song.composer) snippetParts.push(`ألحان: ${song.composer}`);
  if (song.maqam) snippetParts.push(`مقام ${song.maqam}`);
  const lyricsSnippet = song.lyrics ? song.lyrics.slice(0, 120).replace(/\n/g, " ") + "…" : "";
  const description = snippetParts.length
    ? `${snippetParts.join(" · ")}. ${lyricsSnippet}`
    : lyricsSnippet || `كلمات أغنية ${song.title} من ألبوم ${song.album_name} — فيروزيّات`;

  const ogImage = coverUrl(song.cover_local);
  const canonical = `${SITE_URL}/songs/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "فيروزيّات",
      locale: "ar_AR",
      type: "music.song",
      ...(ogImage ? { images: [{ url: ogImage, width: 400, height: 400, alt: song.title }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = await getSongById(Number(id));
  if (!song) notFound();
  return <SongClient song={song} />;
}
