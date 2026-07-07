import { createReadStream, statSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const AUDIO_DIR = process.env.AUDIO_DIR;
  if (!AUDIO_DIR) {
    return new Response("Audio directory not configured", { status: 503 });
  }
  const { path: segments } = await params;
  const filePath = path.join(AUDIO_DIR, ...segments.map(decodeURIComponent));

  let stat: ReturnType<typeof statSync>;
  try {
    stat = statSync(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const size = stat.size;
  const range = req.headers.get("range");
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".mp3": "audio/mpeg", ".opus": "audio/ogg; codecs=opus",
    ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav",
  };
  const contentType = mimeMap[ext] ?? "audio/mpeg";

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : size - 1;
    const chunkSize = end - start + 1;
    const nodeStream = createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;
    return new Response(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
      },
    });
  }

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;
  return new Response(webStream, {
    headers: {
      "Content-Length": String(size),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    },
  });
}
