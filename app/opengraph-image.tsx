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
              background: "#0d0f12",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              stroke="#f7f5ef"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M19 9.5a7 7 0 0 0-9.9 0 7 7 0 0 0 0 9.9l2.2 2.2" />
              <path d="M13 22.5a7 7 0 0 0 9.9 0 7 7 0 0 0 0-9.9L20.7 10.4" />
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
