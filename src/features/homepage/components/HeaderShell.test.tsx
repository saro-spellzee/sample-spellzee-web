import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { header } from "../content";
import { HeaderShell } from "./HeaderShell";

const renderHeader = () =>
  render(
    <>
      <HeaderShell brand={<a href="#top">Spellzee</a>} nav={<nav aria-label={header.navLabel} />} cta={<a href="#book">CTA</a>} />
      <main>
        <button type="button">Page content</button>
      </main>
    </>,
  );
const menuButton = () => screen.getByRole("button", { name: header.menuLabel });
const mobileNav = () => screen.queryByRole("navigation", { name: header.mobileNavLabel });
const menuLink = (label: string) => screen.getAllByRole("link", { name: label }).find((a) => mobileNav()?.contains(a))!;

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
    for (const item of header.nav) expect(menuLink(item.label)).toHaveAttribute("href", item.href);
    expect(menuLink(header.cta.label)).toHaveAttribute("data-action", "book");

    await user.click(menuLink(header.nav[1].label));
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the menu button is pressed again", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(menuButton());
    await user.click(menuButton());

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(mobileNav()).not.toBeInTheDocument();
  });

  it("closes on a tap outside the header, but not on a tap inside the open menu", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(menuButton());

    await user.click(mobileNav()!);
    expect(menuButton()).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Page content" }));
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens from the keyboard, with the menu links next in the Tab order", async () => {
    const user = userEvent.setup();
    renderHeader();

    menuButton().focus();
    await user.keyboard("{Enter}");
    expect(menuButton()).toHaveAttribute("aria-expanded", "true");

    await user.tab();
    expect(menuLink(header.nav[0].label)).toHaveFocus();
  });

  it("closes once keyboard focus moves on past the menu, so it doesn't stay stuck over the page", async () => {
    const user = userEvent.setup();
    renderHeader();
    menuButton().focus();
    await user.keyboard("{Enter}");

    // Through every link in the menu (and its CTA) it stays open...
    for (let i = 0; i <= header.nav.length; i++) await user.tab();
    expect(menuLink(header.cta.label)).toHaveFocus();
    expect(menuButton()).toHaveAttribute("aria-expanded", "true");

    // ...and the next Tab, onto the page, closes it.
    await user.tab();
    expect(screen.getByRole("button", { name: "Page content" })).toHaveFocus();
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("stays open when the window itself loses focus (switching apps)", async () => {
    const user = userEvent.setup();
    renderHeader();
    menuButton().focus();
    await user.keyboard("{Enter}");
    await user.tab();

    menuLink(header.nav[0].label).blur(); // focus goes nowhere on the page: relatedTarget is null

    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
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
