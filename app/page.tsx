import { getAllAlbums, getLibraryStats } from "@/lib/db";
import { HomeClient } from "./HomeClient";

// Revalidate once a day to ensure optimal caching on Vercel Edge CDN
export const revalidate = 86400;

export default async function Home() {
  const [albums, stats] = await Promise.all([
    getAllAlbums(),
    getLibraryStats(),
  ]);

  return <HomeClient initialAlbums={albums} initialStats={stats} />;
}
