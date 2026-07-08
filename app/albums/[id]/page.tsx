import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlbumById } from "@/lib/db";
import AlbumClient from "./AlbumClient";

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
  const data = await getAlbumById(Number(id));
  if (!data) return { title: "ألبوم غير موجود | فيروزيّات" };

  const { album } = data;
  const title = `${album.name} | فيروزيّات`;
  const description = `${album.name} — ألبوم من أغاني السيدة فيروز، يضمّ ${album.song_count} أغنية. استمع وتصفّح الكلمات على فيروزيّات.`;
  const ogImage = coverUrl(album.cover_local);
  const canonical = `${SITE_URL}/albums/${id}`;

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
      type: "music.album",
      ...(ogImage ? { images: [{ url: ogImage, width: 400, height: 400, alt: album.name }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAlbumById(Number(id));
  if (!data) notFound();
  return <AlbumClient data={data} />;
}
