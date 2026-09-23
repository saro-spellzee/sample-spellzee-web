import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { classroom } from "../content";
import { ReadAndAnswer } from "./ReadAndAnswer";

const { read } = classroom;
const wrongIndex = read.options.findIndex((_, i) => i !== read.correctIndex);
const option = (i: number) => screen.getByRole("button", { name: read.options[i] });

describe("ReadAndAnswer", () => {
  it("shows the passage and an unanswered question group", () => {
    render(<ReadAndAnswer />);

    expect(screen.getByText(read.passage)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: read.question })).toBeInTheDocument();
    read.options.forEach((_, i) => expect(option(i)).toHaveAttribute("aria-pressed", "false"));
    expect(screen.queryByText(read.right)).not.toBeInTheDocument();
    expect(screen.queryByText(read.wrong)).not.toBeInTheDocument();
  });

  it("confirms the correct answer", async () => {
    const user = userEvent.setup();
    render(<ReadAndAnswer />);

    await user.click(option(read.correctIndex));

    expect(option(read.correctIndex)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(read.right)).toHaveAttribute("aria-live", "polite");
  });

  it("gives a hint for a wrong answer, then accepts a changed answer", async () => {
    const user = userEvent.setup();
    render(<ReadAndAnswer />);

    await user.click(option(wrongIndex));
    expect(screen.getByText(read.wrong)).toBeInTheDocument();

    await user.click(option(read.correctIndex));
    expect(option(wrongIndex)).toHaveAttribute("aria-pressed", "false");
    expect(option(read.correctIndex)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(read.right)).toBeInTheDocument();
    expect(screen.queryByText(read.wrong)).not.toBeInTheDocument();
  });

  it("can be answered with the keyboard", async () => {
    const user = userEvent.setup();
    render(<ReadAndAnswer />);

    for (let i = 0; i <= read.correctIndex; i++) await user.tab();
    expect(option(read.correctIndex)).toHaveFocus();
    await user.keyboard(" ");

    expect(screen.getByText(read.right)).toBeInTheDocument();
  });

  it("has no axe violations before and after answering", async () => {
    const user = userEvent.setup();
    const { container } = render(<ReadAndAnswer />);
    expect(await axeViolations(container)).toEqual([]);

    await user.click(option(wrongIndex));
    expect(await axeViolations(container)).toEqual([]);
  });
});
