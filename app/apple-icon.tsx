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
          background: "#C9F267",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="13"
            fill="none"
            stroke="#0A0A0C"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeDasharray="66 16"
            transform="rotate(-40 18 18)"
          />
          <circle cx="18" cy="18" r="3.2" fill="#0A0A0C" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
