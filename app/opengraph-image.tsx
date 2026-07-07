import { ImageResponse } from "next/og";

// Site-wide default Open Graph image (spec feature 14). Next's file convention
// auto-attaches this to OG + Twitter metadata for every route once the root
// layout sets `metadataBase`. A branded card: navy field, brass accent rule,
// wordmark + positioning line.
//
// Brand tokens are hardcoded here (satori can't resolve CSS variables): navy
// #0E3A4F, white #FFFFFF, brass-soft #7CC24F, muted-on-dark #A7BCC7. No remote
// font fetch — the built-in sans keeps the build hermetic and fast.

export const alt = "Avesta Nordic — Pharma-grade science. Nature-derived medicine.";
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
          backgroundColor: "#0E3A4F",
          padding: "72px 80px",
        }}
      >
        {/* Brass accent rule, top-left */}
        <div
          style={{
            width: 96,
            height: 12,
            backgroundColor: "#7CC24F",
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
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            AVESTA NORDIC
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 40,
              fontWeight: 500,
              color: "#7CC24F",
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
            color: "#A7BCC7",
          }}
        >
          PREVENTION · PRECAUTION · CURE
        </div>
      </div>
    ),
    { ...size },
  );
}
