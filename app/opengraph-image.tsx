import { ImageResponse } from "next/og";

// Site-wide default Open Graph image (spec feature 14). Next's file convention
// auto-attaches this to OG + Twitter metadata for every route once the root
// layout sets `metadataBase`. A branded card: deep-teal field, lime accent rule,
// wordmark + positioning line.
//
// Brand tokens are hardcoded here (satori can't resolve CSS variables): ink
// #0A3D3F, paper #FAFBF8, lime #C8F04C, grey-on-dark #B8C7C2. No remote font
// fetch — the built-in sans keeps the build hermetic and fast.

export const alt = "Avesta Health — Pharma-grade science. Nature-derived medicine.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A3D3F",
          padding: "72px 80px",
        }}
      >
        {/* Lime accent rule, top-left */}
        <div
          style={{
            width: 96,
            height: 12,
            backgroundColor: "#C8F04C",
            borderRadius: 6,
          }}
        />

        {/* Wordmark + positioning line */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: "#FAFBF8",
              lineHeight: 1,
            }}
          >
            AVESTA HEALTH
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 40,
              fontWeight: 500,
              color: "#C8F04C",
            }}
          >
            Pharma-grade science. Nature-derived medicine.
          </div>
        </div>

        {/* Footer kicker */}
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.18em",
            color: "#B8C7C2",
          }}
        >
          PREVENTION · PRECAUTION · CURE
        </div>
      </div>
    ),
    { ...size },
  );
}
