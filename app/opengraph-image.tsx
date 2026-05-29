import { ImageResponse } from "next/og";

export const alt = "OneLink — One link. Supported USDC routes. Verified on Arc.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fbfbf8",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#0d0f12",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "-0.04em",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              background: "#1E50E5",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="27"
              height="27"
              viewBox="0 0 100 100"
              fill="none"
              stroke="#ffffff"
              strokeWidth="9"
              strokeLinecap="round"
            >
              <path d="M 74.4 20.9 A 38 38 0 1 1 25.6 20.9" />
            </svg>
          </div>
          <span>onelink</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 92,
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              maxWidth: 1040,
            }}
          >
            Get paid in USDC. <span style={{ color: "#75787f" }}>One link.</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#5a5d65",
              fontWeight: 500,
              maxWidth: 940,
              lineHeight: 1.35,
            }}
          >
            USDC payment links for freelancers, creators, and Web3 teams. Settled on Arc Testnet,
            verified on-chain through Circle CCTP.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#5a5d65",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ color: "#0d0f12", fontWeight: 600 }}>onelink-mauve-nu.vercel.app</span>
          <span>Arc · USDC · CCTP</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
