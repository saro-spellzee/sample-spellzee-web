import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { header } from "../content";
import { HeaderShell } from "./HeaderShell";

const renderHeader = () =>
  render(<HeaderShell brand={<a href="#top">Spellzee</a>} nav={<nav aria-label={header.navLabel} />} cta={<a href="#book">CTA</a>} />);
const menuButton = () => screen.getByRole("button", { name: header.menuLabel });
const mobileNav = () => screen.queryByRole("navigation", { name: header.mobileNavLabel });

describe("HeaderShell", () => {
  it("starts with the mobile menu closed", () => {
    renderHeader();

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(mobileNav()).not.toBeInTheDocument(); // hidden
  });

  it("opens the menu with every section link and the booking CTA, and closes on a link tap", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(menuButton());

    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    const nav = mobileNav()!;
    for (const item of header.nav) expect(screen.getAllByRole("link", { name: item.label }).some((a) => nav.contains(a))).toBe(true);
    const cta = screen.getAllByRole("link", { name: header.cta.label }).find((a) => nav.contains(a))!;
    expect(cta).toHaveAttribute("data-action", "book");

    await user.click(screen.getByRole("link", { name: header.nav[1].label }));
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(menuButton());
    await user.keyboard("{Escape}");

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(menuButton()).toHaveFocus();
  });

  it("has no axe violations with the menu open", async () => {
    const user = userEvent.setup();
    const { container } = renderHeader();
    await user.click(menuButton());
    expect(await axeViolations(container)).toEqual([]);
  });
});
