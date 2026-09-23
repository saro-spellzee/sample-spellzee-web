import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { footer } from "../content";
import { NewsletterForm } from "./NewsletterForm";

const { newsletter } = footer;

describe("NewsletterForm", () => {
  it("has a labelled, required email field and a submit button", () => {
    render(<NewsletterForm />);

    const input = screen.getByLabelText(newsletter.label);
    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(screen.getByRole("button", { name: newsletter.submit })).toBeEnabled();
  });

  it("submits a valid email with Enter and clears the field", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    const input = screen.getByLabelText(newsletter.label);

    await user.type(input, "parent@example.com{Enter}");

    await waitFor(() => expect(input).toHaveValue(""));
    expect(screen.getByRole("button", { name: newsletter.submit })).toBeEnabled();
  });

  it("does not submit an invalid email", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    const input = screen.getByLabelText(newsletter.label);

    await user.type(input, "not-an-email");
    await user.click(screen.getByRole("button", { name: newsletter.submit }));

    expect(input).toHaveValue("not-an-email");
    expect(input).toBeInvalid();
  });

  it("has no axe violations", async () => {
    const { container } = render(<NewsletterForm />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
