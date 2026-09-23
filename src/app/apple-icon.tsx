import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { markDataUrl } from "./_og/assets";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon: iOS doesn't do transparency, so the mark sits on the site cream. */
export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: site.themeColor }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> only */}
        <img src={await markDataUrl()} width={120} height={130} alt="" />
      </div>
    ),
    size,
  );
}
