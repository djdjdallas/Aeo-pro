import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 800,
            letterSpacing: "-4px",
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
