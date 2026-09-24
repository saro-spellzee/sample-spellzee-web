import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { requestDemo } from "../../booking/actions";
import { BOOKING_FAILED, HONEYPOT_FIELD, type BookingResult } from "../../booking/schema";
import { booking } from "../../content";
import { BookingDialog } from "./BookingDialog";

vi.mock("../../booking/actions", () => ({ requestDemo: vi.fn() }));
const action = vi.mocked(requestDemo);

const { steps, errors } = booking;
type User = ReturnType<typeof userEvent.setup>;

function renderWithTrigger() {
  return render(
    <>
      <a href="#book" data-action="book">
        Book a Free Demo Class
      </a>
      <BookingDialog />
    </>,
  );
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

// A closed <dialog> is hidden from role queries, so include hidden ones.
const dialog = () => screen.getByRole("dialog", { hidden: true });
const open = (user: User) => user.click(screen.getByRole("link", { name: "Book a Free Demo Class" }));
const errorLine = () => screen.getByRole("alert");
const submitCall = () => screen.getByRole("button", { name: new RegExp(booking.submit.call) });
const confirmation = (parent: string) => screen.queryByRole("heading", { name: booking.done.title.replace("{parent}", parent) });
/** What the dialog sent to the Server Action. */
const sent = (call = 0) => action.mock.calls[call][0] as Record<string, unknown>;

async function fillChild(user: User) {
  await user.type(screen.getByLabelText(booking.kid.label), "Aarav");
  await user.type(screen.getByLabelText(booking.grade.label), "Grade 3");
  await user.click(screen.getByRole("button", { name: /Reading & Spelling/ }));
  await user.click(screen.getByRole("button", { name: booking.continue }));
}

async function fillParent(user: User) {
  await user.type(screen.getByLabelText(booking.parent.label), "Meera Iyer");
  await user.type(screen.getByLabelText(booking.phone.label), "98765 43210");
  await user.click(screen.getByRole("checkbox"));
}

/** Presses Tab until `el` has focus, proving it's reachable from the keyboard. */
async function tabTo(user: User, el: HTMLElement) {
  for (let i = 0; i < 40 && document.activeElement !== el; i++) await user.tab();
  expect(el).toHaveFocus();
}

/** The error line is the field's accessible description while it's invalid. */
function expectInvalid(field: HTMLElement, message: string) {
  expect(errorLine()).toHaveTextContent(message);
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription(expect.stringContaining(message));
  expect(field).toHaveFocus();
}

describe("BookingDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 24, 10, 0)); // Thursday 24 September 2026
    action.mockReset();
    action.mockResolvedValue({ status: "success" });
  });
  afterEach(() => vi.useRealTimers());

  it("stays closed until a booking link is clicked, and the link doesn't navigate", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    expect(screen.queryByRole("heading", { name: steps[0].title })).not.toBeInTheDocument();

    await open(user);

    expect(dialog()).toHaveAttribute("open");
    expect(screen.getByRole("heading", { name: steps[0].title })).toHaveFocus();
    expect(window.location.hash).not.toBe("#book");
  });

  it("checks each step-1 field in turn, linking the message and focusing the field", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    const kid = screen.getByLabelText(booking.kid.label);
    const grade = screen.getByLabelText(booking.grade.label);

    await user.click(screen.getByRole("button", { name: booking.continue }));
    expectInvalid(kid, errors.kid);

    await user.type(kid, "Aarav");
    await user.click(screen.getByRole("button", { name: booking.continue }));
    expectInvalid(grade, errors.grade);
    expect(kid).not.toHaveAttribute("aria-invalid");

    await user.type(grade, "Grade 3");
    await user.click(screen.getByRole("button", { name: booking.continue }));
    expect(errorLine()).toHaveTextContent(errors.difficulties);
    const group = screen.getByRole("group", { name: new RegExp(booking.difficulties.label) });
    expect(group).toHaveAccessibleDescription(errors.difficulties);
    expect(within(group).getAllByRole("button")[0]).toHaveFocus();

    // Picking one clears the message straight away.
    await user.click(screen.getByRole("button", { name: /Reading & Spelling/ }));
    await waitFor(() => expect(errorLine()).toBeEmptyDOMElement());
    expect(action).not.toHaveBeenCalled();
  });

  it("validates a field when it loses focus, not while it's first typed", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);

    await user.type(screen.getByLabelText(booking.kid.label), "A");
    expect(errorLine()).toBeEmptyDOMElement();
    await user.tab();
    expect(errorLine()).toHaveTextContent(errors.kid);
  });

  it("checks each step-2 field in turn, then sends the booking and confirms a call-back", async () => {
    const user = userEvent.setup();
    const { container } = renderWithTrigger();
    await open(user);
    await fillChild(user);
    expect(screen.getByRole("heading", { name: steps[1].title })).toBeInTheDocument();
    expect(screen.getByText("Aarav")).toBeInTheDocument();
    const parent = screen.getByLabelText(booking.parent.label);
    const phone = screen.getByLabelText(booking.phone.label);

    await user.click(submitCall());
    expectInvalid(parent, errors.parent);

    await user.type(parent, "Meera Iyer");
    await user.type(phone, "12345");
    await user.click(submitCall());
    expectInvalid(phone, errors.phone);
    // The phone keeps its own description (the +91 chip and the hint) alongside the error.
    expect(phone).toHaveAccessibleDescription(expect.stringContaining(booking.phone.hint));

    await user.clear(phone);
    await user.type(phone, "98765 43210");
    await user.click(submitCall());
    expectInvalid(screen.getByRole("checkbox"), errors.consent);
    expect(action).not.toHaveBeenCalled();

    await user.click(screen.getByRole("checkbox"));
    await user.click(submitCall());

    expect(await screen.findByRole("heading", { name: booking.done.title.replace("{parent}", "Meera") })).toHaveFocus();
    expect(dialog()).toHaveTextContent("+91 98765 43210");
    expect(action).toHaveBeenCalledOnce();
    expect(sent()).toMatchObject({ kid: "Aarav", grade: "Grade 3", difficulties: ["read"], parent: "Meera Iyer", phone: "9876543210", consent: true, mode: "call" });
    // The honeypot travels with the request so the server can check it; people leave it empty.
    expect(sent()[HONEYPOT_FIELD]).toBe("");
    expect(container.querySelector(`input[name="${HONEYPOT_FIELD}"]`)).toBeNull(); // gone with the form
  });

  it("goes back to step 1 with the answers kept", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);

    await user.click(screen.getByRole("button", { name: booking.edit }));

    expect(screen.getByLabelText(booking.kid.label)).toHaveValue("Aarav");
    expect(screen.getByRole("button", { name: /Reading & Spelling/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: booking.continue }));
    await fillParent(user);
    await user.click(screen.getByRole("button", { name: booking.back }));
    await user.click(screen.getByRole("button", { name: booking.continue }));
    expect(screen.getByLabelText(booking.parent.label)).toHaveValue("Meera Iyer");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("schedules a demo on a picked day and slot", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);
    await fillParent(user);
    await user.click(screen.getByRole("button", { name: /\+ Tamil/ }));

    await user.click(screen.getByRole("radio", { name: new RegExp(booking.mode.schedule.title) }));
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.schedule) }));
    expect(errorLine()).toHaveTextContent(errors.slot);
    const days = within(screen.getByRole("group", { name: /September 2026/ }));
    expect(days.getAllByRole("button").find((b) => !(b as HTMLButtonElement).disabled)).toHaveFocus();

    expect(days.getByRole("button", { name: /Sunday, 27 September/ })).toBeDisabled();
    await user.click(days.getByRole("button", { name: /Saturday, 26 September/ }));
    await user.click(screen.getByRole("button", { name: "10:30 AM" }));
    await waitFor(() => expect(errorLine()).toBeEmptyDOMElement());
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.schedule) }));

    expect(await screen.findByText(/26 Sept? at 10:30 AM/)).toBeInTheDocument();
    expect(dialog()).toHaveTextContent("English + Tamil");
    expect(sent()).toMatchObject({ mode: "schedule", date: "2026-09-26", slot: "10:30 AM", language: "Tamil" });
  });

  it("drops a missing-slot message when the parent switches back to a call-back", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);
    await fillParent(user);
    await user.click(screen.getByRole("radio", { name: new RegExp(booking.mode.schedule.title) }));
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.schedule) }));
    expect(errorLine()).toHaveTextContent(errors.slot);

    await user.click(screen.getByRole("radio", { name: new RegExp(booking.mode.call.title) }));
    await waitFor(() => expect(errorLine()).toBeEmptyDOMElement());
  });

  it("shows a pending state and sends only once while the request is in flight", async () => {
    const reply = deferred<BookingResult>();
    action.mockReturnValueOnce(reply.promise);
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);
    await fillParent(user);

    await user.click(submitCall());
    const busy = await screen.findByRole("button", { name: new RegExp(booking.pending) });
    expect(busy).toBeDisabled();
    await user.type(screen.getByLabelText(booking.parent.label), "{Enter}");
    await user.click(busy);
    expect(action).toHaveBeenCalledOnce();
    expect(confirmation("Meera")).toBeNull();

    reply.resolve({ status: "success" });
    expect(await screen.findByRole("heading", { name: booking.done.title.replace("{parent}", "Meera") })).toBeInTheDocument();
    expect(action).toHaveBeenCalledOnce();
  });

  it.each([
    ["the server can't deliver it", () => action.mockResolvedValueOnce({ status: "failed" })],
    ["the request itself fails", () => action.mockRejectedValueOnce(new Error("network down"))],
  ])("never confirms when %s: a generic message, the answers kept, and a retry works", async (_label, arrange) => {
    arrange();
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);
    await fillParent(user);

    await user.click(submitCall());

    await waitFor(() => expect(errorLine()).toHaveTextContent(BOOKING_FAILED));
    expect(errorLine()).not.toHaveTextContent("network down");
    expect(confirmation("Meera")).toBeNull();
    expect(screen.getByLabelText(booking.parent.label)).toHaveValue("Meera Iyer");
    expect(submitCall()).toBeEnabled();

    await user.click(submitCall());
    expect(await screen.findByRole("heading", { name: booking.done.title.replace("{parent}", "Meera") })).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(2);
  });

  it("shows the server's field errors, going back to step 1 and focusing the field when it's there", async () => {
    action.mockResolvedValueOnce({ status: "invalid", errors: { grade: errors.grade } });
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);
    await fillParent(user);

    await user.click(submitCall());

    expect(await screen.findByRole("heading", { name: steps[0].title })).toBeInTheDocument();
    await waitFor(() => expectInvalid(screen.getByLabelText(booking.grade.label), errors.grade));
    expect(confirmation("Meera")).toBeNull();
  });

  it("can be completed with the keyboard alone", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    screen.getByRole("link", { name: "Book a Free Demo Class" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: steps[0].title })).toHaveFocus();

    await tabTo(user, screen.getByLabelText(booking.kid.label));
    await user.keyboard("Aarav");
    await user.tab();
    await user.keyboard("Grade 3");
    await tabTo(user, screen.getByRole("button", { name: /Reading & Spelling/ }));
    await user.keyboard(" ");
    await tabTo(user, screen.getByRole("button", { name: booking.continue }));
    await user.keyboard("{Enter}");

    expect(screen.getByRole("heading", { name: steps[1].title })).toHaveFocus();
    await tabTo(user, screen.getByLabelText(booking.parent.label));
    await user.keyboard("Meera Iyer");
    await user.tab();
    await user.keyboard("9876543210");
    await tabTo(user, screen.getByRole("checkbox"));
    await user.keyboard(" ");
    await tabTo(user, submitCall());
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("heading", { name: booking.done.title.replace("{parent}", "Meera") })).toHaveFocus();
    expect(sent()).toMatchObject({ kid: "Aarav", parent: "Meera Iyer", phone: "9876543210", consent: true });
  });

  it("closes with the close button, keeps unfinished answers, and starts fresh after a booking", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await user.type(screen.getByLabelText(booking.kid.label), "Aarav");
    await user.click(screen.getByRole("button", { name: booking.close }));
    expect(dialog()).not.toHaveAttribute("open");

    await open(user);
    expect(screen.getByLabelText(booking.kid.label)).toHaveValue("Aarav"); // kept while unfinished

    await user.clear(screen.getByLabelText(booking.kid.label));
    await fillChild(user);
    await fillParent(user);
    await user.click(submitCall());
    await user.click(await screen.findByRole("button", { name: booking.done.button }));
    await open(user);
    expect(screen.getByLabelText(booking.kid.label)).toHaveValue("");
  });

  it("has no axe violations on either step, with errors showing too", async () => {
    const user = userEvent.setup();
    const { container } = renderWithTrigger();
    await open(user);
    expect(await axeViolations(container)).toEqual([]);
    await user.click(screen.getByRole("button", { name: booking.continue }));
    expect(await axeViolations(container)).toEqual([]);
    await fillChild(user);
    await user.click(submitCall());
    expect(await axeViolations(container)).toEqual([]);
  });
});
