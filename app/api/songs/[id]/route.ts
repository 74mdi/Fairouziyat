import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getSongById } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const song = await getSongById(Number(id));
    if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(song);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
