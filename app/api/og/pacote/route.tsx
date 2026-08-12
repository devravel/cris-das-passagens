import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolvePublicOgImageUrl } from "@/lib/seo/og-image-url";

export const revalidate = 3600;

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const BRAND_NAVY = "#0d1b35";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  let title = "";
  let imageUrl = "";

  try {
    const pkg = await prisma.package.findUnique({
      where: { slug },
      select: { title: true, image: true },
    });

    if (pkg) {
      title = pkg.title;
      imageUrl = resolvePublicOgImageUrl(pkg.image);
    }
  } catch {
    // fall through — renders without background photo
  }

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            backgroundColor: BRAND_NAVY,
          }}
        >
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={OG_WIDTH}
              height={OG_HEIGHT}
              style={{
                position: "absolute",
                inset: "0",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          )}

          {/* gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: "0",
              background:
                "linear-gradient(to bottom, rgba(13,27,53,0.10) 0%, rgba(13,27,53,0.55) 40%, rgba(13,27,53,0.96) 100%)",
              display: "flex",
            }}
          />

          {/* content */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              padding: "40px 56px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {title && (
              <div
                style={{
                  fontSize: title.length > 40 ? 44 : 56,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {title}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "22px",
                  backgroundColor: "#4a90d9",
                  borderRadius: "2px",
                }}
              />
              <div
                style={{
                  fontSize: 22,
                  color: "rgba(255,255,255,0.80)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Cris das Passagens · Pacotes e Passagens Turísticas
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
      },
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
