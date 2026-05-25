import { NextResponse } from "next/server";

import { STORAGE_MEDIA_BUCKETS } from "@/lib/storage/media-url";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type MediaRouteProps = {
  params: Promise<{ bucket: string; path: string[] }>;
};

export async function GET(_request: Request, { params }: MediaRouteProps) {
  const { bucket: rawBucket, path: rawPath } = await params;
  const bucket = decodeURIComponent(rawBucket);
  const objectPath = rawPath.map((segment) => decodeURIComponent(segment)).join("/");

  if (!STORAGE_MEDIA_BUCKETS.has(bucket) || !objectPath || objectPath.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.storage.from(bucket).download(objectPath);

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const contentType = data.type || guessContentType(objectPath);

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}

function guessContentType(path: string) {
  const extension = path.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
