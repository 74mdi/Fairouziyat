import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { searchSongsAndAlbums } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q") || "";
    if (!q.trim()) return NextResponse.json({ songs: [], albums: [] });
    const results = await searchSongsAndAlbums(q);
    return NextResponse.json(results);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
