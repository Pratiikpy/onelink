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
          background: "#0d0f12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="120"
          height="120"
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
    ),
    { ...size },
  );
}
