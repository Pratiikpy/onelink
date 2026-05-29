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
          background: "#1E50E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
        }}
      >
        <svg
          width="42"
          height="42"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
        >
          <path d="M 74.4 20.9 A 38 38 0 1 1 25.6 20.9" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
