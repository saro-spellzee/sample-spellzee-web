import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { footer } from "../content";
import { subscribeToNewsletter } from "../newsletter/actions";
import type { NewsletterState } from "../newsletter/schema";
import { NewsletterForm } from "./NewsletterForm";

vi.mock("../newsletter/actions", () => ({ subscribeToNewsletter: vi.fn() }));
const action = vi.mocked(subscribeToNewsletter);

const { newsletter } = footer;
const emailInput = () => screen.getByLabelText(newsletter.label);
const submitButton = () => screen.getByRole("button", { name: newsletter.submit });
/** The email the action was called with (from the FormData the form sent). */
const sentEmail = (call = 0) => (action.mock.calls[call][1] as FormData).get("email");

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

beforeEach(() => {
  action.mockReset();
  action.mockResolvedValue({ status: "success" });
});

describe("NewsletterForm", () => {
  it("has a labelled, required email field with email autocomplete and a submit button", () => {
    render(<NewsletterForm />);

    const input = emailInput();
    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(submitButton()).toBeEnabled();
  });

  it("submits a valid email with Enter, announces success and clears the field", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(emailInput(), "parent@example.com{Enter}");

    expect(await screen.findByRole("status")).toHaveTextContent(newsletter.success);
    expect(action).toHaveBeenCalledOnce();
    expect(sentEmail()).toBe("parent@example.com");
    expect(emailInput()).toHaveValue("");
    expect(submitButton()).toBeEnabled();
  });

  it("can be completed with the keyboard alone (Tab to the field, Tab to the button, Enter)", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.tab();
    expect(emailInput()).toHaveFocus();
    await user.keyboard("parent@example.com");
    await user.tab();
    expect(submitButton()).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("status")).toHaveTextContent(newsletter.success);
    expect(sentEmail()).toBe("parent@example.com");
  });

  it("skips the honeypot when tabbing", async () => {
    const user = userEvent.setup();
    const { container } = render(<NewsletterForm />);
    const trap = container.querySelector<HTMLInputElement>('input[name="website"]');

    await user.tab();
    await user.tab();
    expect(submitButton()).toHaveFocus();
    expect(trap).not.toHaveFocus();
    expect(trap?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it.each([
    ["an empty field", "", newsletter.errors.required],
    ["an invalid email", "not-an-email", newsletter.errors.invalid],
  ])("blocks %s with a linked error message and focuses the field", async (_label, value, message) => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    if (value) await user.type(emailInput(), value);

    await user.click(submitButton());

    const error = await screen.findByText(message);
    const input = emailInput();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.id);
    expect(input).toHaveAccessibleDescription(message);
    expect(input).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("validates on blur, then clears the error once the value is fixed", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(emailInput(), "parent@");
    expect(screen.queryByText(newsletter.errors.invalid)).toBeNull(); // not while typing the first time
    await user.tab();
    expect(await screen.findByText(newsletter.errors.invalid)).toBeInTheDocument();

    await user.type(emailInput(), "example.com");
    await waitFor(() => expect(screen.queryByText(newsletter.errors.invalid)).toBeNull());
    expect(emailInput()).not.toHaveAttribute("aria-invalid");
  });

  it("shows a pending state and ignores repeat submits while in flight", async () => {
    const pending = deferred<NewsletterState>();
    action.mockReturnValueOnce(pending.promise);
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(emailInput(), "parent@example.com{Enter}");
    const busy = await screen.findByRole("button", { name: newsletter.pending });
    expect(busy).toBeDisabled();

    await user.type(emailInput(), "{Enter}");
    await user.click(busy);
    expect(action).toHaveBeenCalledOnce();

    pending.resolve({ status: "success" });
    expect(await screen.findByRole("button", { name: newsletter.submit })).toBeEnabled();
    expect(action).toHaveBeenCalledOnce();
  });

  it("shows server-side field errors on the field", async () => {
    action.mockResolvedValueOnce({ status: "invalid", errors: { email: newsletter.errors.invalid } });
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(emailInput(), "parent@example.com{Enter}");

    expect(await screen.findByText(newsletter.errors.invalid)).toBeInTheDocument();
    expect(emailInput()).toHaveAttribute("aria-invalid", "true");
    expect(emailInput()).toHaveFocus();
  });

  it.each([
    ["the server reports a failure", () => action.mockResolvedValueOnce({ status: "failed" })],
    ["the request itself throws", () => action.mockRejectedValueOnce(new Error("network down"))],
  ])("shows a generic error and keeps the email when %s", async (_label, arrange) => {
    arrange();
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(emailInput(), "parent@example.com{Enter}");

    expect(await screen.findByRole("status")).toHaveTextContent(newsletter.errors.failed);
    expect(screen.getByRole("status")).not.toHaveTextContent("network down");
    expect(emailInput()).toHaveValue("parent@example.com");
    expect(submitButton()).toBeEnabled();
  });

  it("has no axe violations, including with an error showing", async () => {
    const user = userEvent.setup();
    const { container } = render(<NewsletterForm />);
    expect(await axeViolations(container)).toEqual([]);

    await user.click(submitButton());
    await screen.findByText(newsletter.errors.required);
    expect(await axeViolations(container)).toEqual([]);
  });
});
