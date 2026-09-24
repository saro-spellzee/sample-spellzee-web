/* eslint-disable @next/next/no-img-element -- next/og renders plain <img> only */
import { ImageResponse } from "next/og";
import { heroDataUrl, logoDataUrl, ogFonts } from "./assets";

export const socialCardSize = { width: 1200, height: 630 };
export const socialCardAlt =
  "Spellzee: Read. Write. Speak. Confidently. Cognitive Literacy Mapping and 1:1 live mentoring.";

// Hero photo is 1672×941; scaled to the card height the child sits ~70% across,
// so shift it right until she lands in the right third of the card.
const PHOTO_H = 630;
const PHOTO_W = Math.round((1672 / 941) * PHOTO_H);

/** Branded share card built from the hero: headline left, photo right. */
export async function renderSocialCard() {
  const [logo, hero, fonts] = await Promise.all([logoDataUrl(), heroDataUrl(), ogFonts()]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#FCF8F4", fontFamily: "Jakarta" }}>
        <img src={hero} width={PHOTO_W} height={PHOTO_H} alt="" style={{ position: "absolute", top: 0, left: 150 }} />
        <div
          style={{
            // satori ignores the `inset` shorthand; spell out the box.
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex",
            background: "linear-gradient(90deg, #FCF8F4 0%, #FCF8F4 42%, rgba(252,248,244,0.6) 58%, rgba(252,248,244,0) 72%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 72px", width: 700 }}>
          <img src={logo} width={210} height={60} alt="" />
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, fontSize: 60, fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.035em", color: "#0E1A3A" }}>
            <span>Read. Write. Speak.</span>
            <span style={{ color: "#1557D6" }}>Confidently.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 25, fontWeight: 500, color: "#4B5575" }}>
            Cognitive Literacy Mapping · 1:1 live mentoring
          </div>
          <div style={{ display: "flex", marginTop: 34 }}>
            <div
              style={{
                display: "flex", padding: "14px 28px", borderRadius: 999, fontSize: 23, fontWeight: 800, color: "#fff",
                background: "linear-gradient(90deg, #2F6BF2, #5B4FE8)",
              }}
            >
              Book a Free Demo Class
            </div>
          </div>
        </div>
      </div>
    ),
    { ...socialCardSize, fonts },
  );
}
