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
          background: "#C9F267",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
        }}
      >
        <svg width="42" height="42" viewBox="0 0 36 36">
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
