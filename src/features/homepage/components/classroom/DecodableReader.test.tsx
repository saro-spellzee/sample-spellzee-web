import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { classroom } from "../../content";
import { DecodableReader } from "./DecodableReader";

const { reader } = classroom;
const { words } = reader;
const word = (i: number) => screen.getByRole("button", { name: words[i].text });
/** What the polite live region under the sentence says. */
const announced = (container: HTMLElement) => container.querySelector("[aria-live='polite']")!.textContent;
/** A decodable word other than the one selected on load, and the sight word. */
const decodable = words.findIndex((w, i) => w.sounds && i !== reader.initial);
const sight = words.findIndex((w) => w.sounds === null);

function expectSelected(active: number) {
  words.forEach((_, i) => expect(word(i)).toHaveAttribute("aria-pressed", String(i === active)));
}

describe("DecodableReader", () => {
  it("starts on the designated word, announcing its sounds", () => {
    const { container } = render(<DecodableReader />);

    expectSelected(reader.initial);
    expect(announced(container)).toBe(words[reader.initial].sounds?.join("") ?? reader.tricky);
    expect(screen.getByText(reader.note)).toBeInTheDocument();
  });

  it("shows the sounds of a tapped word", async () => {
    const user = userEvent.setup();
    const { container } = render(<DecodableReader />);

    await user.click(word(decodable));

    expectSelected(decodable);
    expect(announced(container)).toBe(words[decodable].sounds!.join(""));
  });

  it("flags a sight word to learn by sight instead of sounding out", async () => {
    const user = userEvent.setup();
    const { container } = render(<DecodableReader />);

    await user.click(word(sight));

    expectSelected(sight);
    expect(announced(container)).toBe(reader.tricky);
  });

  it("works from the keyboard with Tab, Enter and Space", async () => {
    const user = userEvent.setup();
    const { container } = render(<DecodableReader />);

    await user.tab();
    expect(word(0)).toHaveFocus();
    await user.keyboard("{Enter}");
    expectSelected(0);

    for (let i = 0; i < sight; i++) await user.tab();
    await user.keyboard(" ");
    expectSelected(sight);
    expect(announced(container)).toBe(reader.tricky);
  });

  it("has no axe violations", async () => {
    const { container } = render(<DecodableReader />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
