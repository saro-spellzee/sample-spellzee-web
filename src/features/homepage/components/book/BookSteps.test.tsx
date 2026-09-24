import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { book } from "../../content";
import { BookSteps } from "./BookSteps";

const step = (i: number) => screen.getByRole("button", { name: new RegExp(book.steps[i].title) });

function expectHighlighted(active: number) {
  book.steps.forEach((_, i) => expect(step(i)).toHaveAttribute("aria-pressed", String(i === active)));
}

describe("BookSteps", () => {
  it("lists the steps in a labelled list, each with its number, description and time", () => {
    render(<BookSteps />);

    const list = screen.getByRole("list", { name: book.stepsLabel });
    expect(within(list).getAllByRole("listitem")).toHaveLength(book.steps.length);
    for (const [i, s] of book.steps.entries()) {
      expect(step(i)).toHaveTextContent(String(s.n));
      expect(step(i)).toHaveTextContent(s.description);
      expect(step(i)).toHaveTextContent(s.time);
    }
  });

  it("highlights the designated step to start", () => {
    render(<BookSteps />);

    expectHighlighted(book.initialStep);
  });

  it("moves the highlight to the tapped step", async () => {
    const user = userEvent.setup();
    render(<BookSteps />);

    await user.click(step(0));
    expectHighlighted(0);

    await user.click(step(1));
    expectHighlighted(1);
  });

  it("works from the keyboard with Tab, Enter and Space", async () => {
    const user = userEvent.setup();
    render(<BookSteps />);

    await user.tab();
    expect(step(0)).toHaveFocus();
    await user.keyboard("{Enter}");
    expectHighlighted(0);

    await user.tab();
    expect(step(1)).toHaveFocus();
    await user.keyboard(" ");
    expectHighlighted(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(<BookSteps />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
