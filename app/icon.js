import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-1px",
            lineHeight: 1,
            display: "flex",
          }}
        >
          <span style={{ color: "#ffffff" }}>F</span>
          <span style={{ color: "#3b82f6" }}>A</span>
        </span>
      </div>
    ),
    { ...size }
  );
}
