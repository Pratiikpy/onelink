import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="13"
            fill="none"
            stroke="#C9F267"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="66 16"
            transform="rotate(-40 18 18)"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
