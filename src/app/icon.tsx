import { ImageResponse } from "next/og";
import { markDataUrl } from "./_og/assets";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Favicon / app icon: the Spellzee book mark on a transparent square. */
export default async function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> only */}
        <img src={await markDataUrl()} width={444} height={480} alt="" />
      </div>
    ),
    size,
  );
}
