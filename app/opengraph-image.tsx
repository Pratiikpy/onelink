import { ImageResponse } from "next/og";

export const alt = "OneLink Collect — One link. Any USDC. Instantly on Arc.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 20% 0%, rgba(143,132,255,0.34), transparent 60%), linear-gradient(180deg, #0a0a0d 0%, #050507 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#8F84FF",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          OneLink · Collect
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
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            One link. Any USDC. Instantly on Arc.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#a4a1ad",
              fontWeight: 500,
              maxWidth: 920,
            }}
          >
            Mobile-first USDC payment links · Arc Testnet · Circle App Kit · CCTP bridging from
            Base, Ethereum, and Arbitrum Sepolia.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#55d79a",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          <span>Pay. Bridge. Settle.</span>
          <span style={{ color: "#a4a1ad" }}>onelink.collect</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
