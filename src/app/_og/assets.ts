import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Build-time helpers for next/og images (icons, Open Graph). Server only. */

const dataUrl = async (publicPath: string, type: string) =>
  `data:${type};base64,${(await readFile(join(process.cwd(), "public", publicPath))).toString("base64")}`;

export const markDataUrl = () => dataUrl("images/homepage/spellzee-mark.png", "image/png");
export const logoDataUrl = () => dataUrl("images/homepage/spellzee-logo.png", "image/png");
export const heroDataUrl = () => dataUrl("images/homepage/hero-child.jpg", "image/jpeg");

const font = (file: string) => readFile(join(process.cwd(), "src/app/_og/fonts", file));

/** Brand fonts as WOFF (next/og cannot read the woff2 files next/font serves). */
export const ogFonts = async () => [
  { name: "Jakarta", data: await font("PlusJakartaSans-800.woff"), weight: 800 as const, style: "normal" as const },
  { name: "Jakarta", data: await font("PlusJakartaSans-500.woff"), weight: 500 as const, style: "normal" as const },
  { name: "Instrument", data: await font("InstrumentSerif-400-italic.woff"), weight: 400 as const, style: "italic" as const },
];
