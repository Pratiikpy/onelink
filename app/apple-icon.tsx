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
          background: "linear-gradient(180deg, #14122a 0%, #050507 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8F84FF",
          fontWeight: 900,
          fontSize: 96,
          letterSpacing: "-0.04em",
        }}
      >
        OL
      </div>
    ),
    { ...size },
  );
}
