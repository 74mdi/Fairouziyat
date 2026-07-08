import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getAllAlbums } from "@/lib/db";

export async function GET() {
  try {
    const albums = await getAllAlbums();
    return NextResponse.json(albums, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
