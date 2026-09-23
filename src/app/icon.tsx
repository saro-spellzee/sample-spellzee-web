import { ImageResponse } from "next/og";
import { markDataUrl } from "./_og/assets";

// 48px (Google's favicon unit). Browsers fetch this on every first visit, and the old
// 512px PNG was 87 KB, about half a second on a slow mobile connection.
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

/** Favicon / app icon: the Spellzee book mark on a transparent square. */
export default async function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> only */}
        <img src={await markDataUrl()} width={42} height={45} alt="" />
      </div>
    ),
    size,
  );
}
