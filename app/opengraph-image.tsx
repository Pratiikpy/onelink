import { ImageResponse } from "next/og";

export const alt = "OneLink Collect — One link. Supported USDC. Verified on Arc.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0C",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#FAFAFA",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#FAFAFA",
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "-0.04em",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="13"
              fill="none"
              stroke="#FAFAFA"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="66 16"
              transform="rotate(-40 18 18)"
            />
          </svg>
          onelink
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
              fontSize: 96,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            One link. Supported USDC. <span style={{ color: "#C9F267" }}>Verified on Arc.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#8F9198",
              fontWeight: 500,
              maxWidth: 920,
            }}
          >
            Mobile-first USDC payment links · Arc Testnet · Circle App Kit · CCTP bridging from
            Base, Ethereum, Arbitrum Sepolia, and Polygon Amoy.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#C9F267",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          <span>Pay. Bridge. Settle.</span>
          <span style={{ color: "#8F9198" }}>onelink.collect</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
