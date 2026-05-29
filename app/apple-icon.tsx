import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1E50E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
        >
          <path d="M 74.4 20.9 A 38 38 0 1 1 25.6 20.9" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
