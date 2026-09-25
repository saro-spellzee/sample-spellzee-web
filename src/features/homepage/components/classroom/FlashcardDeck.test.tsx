import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { classroom } from "../../content";
import { FlashcardDeck } from "./FlashcardDeck";

const { flashcards } = classroom;
const { deck } = flashcards;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// The card is one button named by whichever face is showing (the other face is aria-hidden).
// jsdom applies no CSS, so a name runs its spans together.
const front = (i: number) => screen.getByRole("button", { name: new RegExp(`^${escape(deck[i].grapheme)}\\s*${escape(flashcards.tap)}$`) });
const back = (i: number) =>
  screen.getByRole("button", { name: new RegExp(`^${escape(flashcards.say.replace("{grapheme}", deck[i].grapheme))}\\s*${escape(deck[i].words)}$`) });
const counter = (n: number) => screen.getByText(flashcards.counter.replace("{n}", String(n)).replace("{total}", String(deck.length)));

describe("FlashcardDeck", () => {
  it("starts on the first card, face up, with the counter", () => {
    render(<FlashcardDeck />);

    expect(front(0)).toBeInTheDocument();
    expect(counter(1)).toBeInTheDocument();
  });

  it("flips to show how to say the sound, and back again", async () => {
    const user = userEvent.setup();
    render(<FlashcardDeck />);

    await user.click(front(0));
    expect(back(0)).toBeInTheDocument();

    await user.click(back(0));
    expect(front(0)).toBeInTheDocument();
  });

  it("steps through the deck both ways, wrapping, and shows each new card face up", async () => {
    const user = userEvent.setup();
    render(<FlashcardDeck />);

    await user.click(front(0));
    await user.click(screen.getByRole("button", { name: flashcards.next }));
    expect(front(1)).toBeInTheDocument();
    expect(counter(2)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: flashcards.previous }));
    await user.click(screen.getByRole("button", { name: flashcards.previous }));
    expect(front(deck.length - 1)).toBeInTheDocument();
    expect(counter(deck.length)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: flashcards.next }));
    expect(front(0)).toBeInTheDocument();
  });

  it("works from the keyboard: Enter and Space flip, the arrows' buttons step", async () => {
    const user = userEvent.setup();
    render(<FlashcardDeck />);

    await user.tab();
    expect(front(0)).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(back(0)).toHaveFocus();
    await user.keyboard(" ");
    expect(front(0)).toHaveFocus();

    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: flashcards.next })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(front(1)).toBeInTheDocument();
  });

  it("has no axe violations on either face", async () => {
    const user = userEvent.setup();
    const { container } = render(<FlashcardDeck />);
    expect(await axeViolations(container)).toEqual([]);

    await user.click(front(0));
    expect(await axeViolations(container)).toEqual([]);
  });
});
