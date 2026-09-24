import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { hero } from "../content";
import { HeroTags } from "./HeroTags";

const [first, second] = hero.tags;
const tag = (label: string) => screen.getByRole("button", { name: label });
const tip = (id: string) => document.getElementById(`hero-tip-${id}`)!;
const isShown = (el: HTMLElement) => el.className.split(/\s+/).includes("opacity-100");

describe("HeroTags", () => {
  it("renders each skill tag as a button described by its tooltip", () => {
    render(<HeroTags />);

    for (const t of hero.tags) expect(tag(t.label)).toHaveAccessibleDescription(t.tip);
    expect(screen.getAllByRole("tooltip")).toHaveLength(hero.tags.length);
  });

  it("is reachable with Tab in order", async () => {
    const user = userEvent.setup();
    render(<HeroTags />);

    await user.tab();
    expect(tag(first.label)).toHaveFocus();
    await user.tab();
    expect(tag(second.label)).toHaveFocus();
  });

  it("toggles its tooltip on click (touch and pointer users)", async () => {
    const user = userEvent.setup();
    render(<HeroTags />);

    await user.click(tag(first.label));
    expect(tag(first.label)).toHaveAttribute("aria-expanded", "true");
    expect(isShown(tip(first.id))).toBe(true);

    await user.click(tag(first.label));
    expect(tag(first.label)).toHaveAttribute("aria-expanded", "false");
    expect(isShown(tip(first.id))).toBe(false);
  });

  it("closes a tapped-open tooltip when the pointer leaves the tag", async () => {
    const user = userEvent.setup();
    render(<HeroTags />);

    await user.click(tag(first.label));
    await user.unhover(tag(first.label));

    expect(tag(first.label)).toHaveAttribute("aria-expanded", "false");
    expect(isShown(tip(first.id))).toBe(false);
  });

  it("closes a tapped-open tooltip when focus moves on", async () => {
    const user = userEvent.setup();
    render(<HeroTags />);

    await user.click(tag(first.label));
    await user.tab();

    expect(tag(second.label)).toHaveFocus();
    expect(tag(first.label)).toHaveAttribute("aria-expanded", "false");
    expect(isShown(tip(first.id))).toBe(false);
  });

  it("opens one tapped tooltip at a time", async () => {
    const user = userEvent.setup();
    render(<HeroTags />);

    await user.click(tag(first.label));
    await user.click(tag(second.label));

    expect(tag(first.label)).toHaveAttribute("aria-expanded", "false");
    expect(tag(second.label)).toHaveAttribute("aria-expanded", "true");
  });

  it("dismisses the tooltip with Escape until focus leaves", async () => {
    const user = userEvent.setup();
    render(<HeroTags />);

    await user.click(tag(first.label));
    await user.keyboard("{Escape}");
    expect(tag(first.label)).toHaveAttribute("aria-expanded", "false");
    // Hover/focus reveal classes are withheld while dismissed.
    expect(tip(first.id).className).not.toContain("group-hover:opacity-100");

    await user.tab();
    expect(tip(first.id).className).toContain("group-hover:opacity-100");
  });

  it("has no axe violations", async () => {
    const { container } = render(<HeroTags />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
