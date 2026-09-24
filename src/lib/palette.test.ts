import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { palette, paletteTokens, type PaletteColor } from "./palette";

const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

/** The value a `@theme` token is declared with in globals.css. */
function tokenValue(name: string) {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
  return match?.[1].toLowerCase();
}

describe("palette", () => {
  it.each(Object.keys(palette) as PaletteColor[])("%s matches its @theme token", (color) => {
    expect(tokenValue(paletteTokens[color])).toBe(palette[color].toLowerCase());
  });
});
