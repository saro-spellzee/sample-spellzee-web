import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { classroom } from "../content";
import { BlendGame } from "./BlendGame";

const { blend } = classroom;
const fill = (template: string, word: string) => template.replace("{word}", word);
const soundButton = (sound: string) =>
  screen.getByRole("button", { name: blend.soundLabel.replace("{sound}", sound) });

/** Taps the sounds of a word by index into `parts` (0,1,2 is the correct order). */
async function tapParts(user: ReturnType<typeof userEvent.setup>, wordIndex: number, order: number[]) {
  for (const i of order) await user.click(soundButton(blend.words[wordIndex].parts[i]));
}

describe("BlendGame", () => {
  it("starts on the first word with the prompt and every sound available", () => {
    render(<BlendGame />);
    const word = blend.words[0];

    expect(screen.getByText(fill(blend.prompt, word.word))).toBeInTheDocument();
    for (const part of word.parts) expect(soundButton(part)).toHaveAttribute("aria-disabled", "false");
  });

  it("shows the success message and the word when the sounds are tapped in order", async () => {
    const user = userEvent.setup();
    render(<BlendGame />);
    const word = blend.words[0];

    await tapParts(user, 0, [0, 1, 2]);

    expect(screen.getByText(fill(blend.success, word.word))).toBeInTheDocument();
    expect(screen.getByText(word.word)).toBeInTheDocument();
  });

  it("asks to retry and marks the result wrong when the order is wrong", async () => {
    const user = userEvent.setup();
    render(<BlendGame />);

    await tapParts(user, 0, [2, 1, 0]);

    expect(screen.getByText(blend.retry)).toBeInTheDocument();
    expect(screen.getByText(blend.wrong)).toBeInTheDocument();
  });

  it("marks a used sound as disabled and ignores a second tap on it", async () => {
    const user = userEvent.setup();
    render(<BlendGame />);
    const first = blend.words[0].parts[0];

    await user.click(soundButton(first));
    await user.click(soundButton(first));

    expect(soundButton(first)).toHaveAttribute("aria-disabled", "true");
    // Only one slot is filled: the prompt is still showing, not a result.
    expect(screen.getByText(fill(blend.prompt, blend.words[0].word))).toBeInTheDocument();
    expect(screen.getAllByText(first)).toHaveLength(2); // the filled slot + the button
  });

  it("clears the picks when Try again is pressed", async () => {
    const user = userEvent.setup();
    render(<BlendGame />);

    await tapParts(user, 0, [2, 1, 0]);
    await user.click(screen.getByRole("button", { name: blend.reset }));

    expect(screen.getByText(fill(blend.prompt, blend.words[0].word))).toBeInTheDocument();
    for (const part of blend.words[0].parts) expect(soundButton(part)).toHaveAttribute("aria-disabled", "false");
  });

  it("moves to the next word, clears picks, and wraps after the last word", async () => {
    const user = userEvent.setup();
    render(<BlendGame />);
    const next = screen.getByRole("button", { name: blend.next });

    await user.click(soundButton(blend.words[0].parts[0]));
    await user.click(next);
    expect(screen.getByText(fill(blend.prompt, blend.words[1].word))).toBeInTheDocument();
    for (const part of blend.words[1].parts) expect(soundButton(part)).toHaveAttribute("aria-disabled", "false");

    for (let i = 2; i <= blend.words.length; i++) await user.click(next);
    expect(screen.getByText(fill(blend.prompt, blend.words[0].word))).toBeInTheDocument();
  });

  it("can be played with the keyboard alone", async () => {
    const user = userEvent.setup();
    render(<BlendGame />);
    const word = blend.words[0];

    for (const [n, part] of word.parts.entries()) {
      soundButton(part).focus();
      await user.keyboard(n % 2 === 0 ? "{Enter}" : " ");
    }

    expect(screen.getByText(fill(blend.success, word.word))).toBeInTheDocument();
  });

  it("announces feedback in a polite live region", async () => {
    const user = userEvent.setup();
    render(<BlendGame />);

    await tapParts(user, 0, [0, 1, 2]);

    expect(screen.getByText(fill(blend.success, blend.words[0].word))).toHaveAttribute("aria-live", "polite");
  });

  it("has no axe violations before and after a round", async () => {
    const user = userEvent.setup();
    const { container } = render(<BlendGame />);
    expect(await axeViolations(container)).toEqual([]);

    await tapParts(user, 0, [0, 1, 2]);
    expect(await axeViolations(container)).toEqual([]);
  });
});
