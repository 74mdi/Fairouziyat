import { createReadStream, statSync } from "fs";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const COVERS_DIR = process.env.COVERS_DIR;
  if (!COVERS_DIR) return new Response("Covers directory not configured", { status: 503 });
  const { path: segments } = await params;
  const filePath = path.join(COVERS_DIR, ...segments.map(decodeURIComponent));

  let stat: ReturnType<typeof statSync>;
  try { stat = statSync(filePath); } catch { return new Response("Not found", { status: 404 }); }

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp",
  };
  const contentType = mimeMap[ext] ?? "image/jpeg";
  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;
  return new Response(webStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
