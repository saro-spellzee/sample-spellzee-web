import { describe, expect, it } from "vitest";
import { fullLoadPlan } from "./full-load";

const url = (path: string) => new URL(path, "https://spellzee.in");

describe("fullLoadPlan", () => {
  it("reloads when the link is the page on screen, so the error screen can't stay up", () => {
    expect(fullLoadPlan(url("/"), url("/"))).toEqual({ reloadAt: "https://spellzee.in/" });
  });

  it("reloads at the fragment when only the #fragment differs (a jump would just scroll)", () => {
    expect(fullLoadPlan(url("/#book"), url("/"))).toEqual({ reloadAt: "https://spellzee.in/#book" });
    expect(fullLoadPlan(url("/"), url("/#faq"))).toEqual({ reloadAt: "https://spellzee.in/" });
  });

  it("loads any other page as a new document", () => {
    expect(fullLoadPlan(url("/#book"), url("/phonics"))).toEqual({ assign: "https://spellzee.in/#book" });
    expect(fullLoadPlan(url("/"), url("/?ref=mail"))).toEqual({ assign: "https://spellzee.in/" });
  });
});
