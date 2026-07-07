import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getLibraryStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getLibraryStats();
    return NextResponse.json(stats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
