import { ImageResponse } from "next/og";

import { content } from "@/config/content";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${content.meta.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #345ba7 0%, #1e3a6e 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 880,
            fontSize: 26,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.88)",
            textAlign: "center",
          }}
        >
          {content.meta.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
