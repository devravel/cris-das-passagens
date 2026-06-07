import { NextResponse } from "next/server";

import {
  getSupabasePublicObjectUrl,
  STORAGE_MEDIA_BUCKETS,
} from "@/lib/storage/media-url";

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

  const directUrl = getSupabasePublicObjectUrl(bucket, objectPath);

  if (!directUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(directUrl, 308);
}
