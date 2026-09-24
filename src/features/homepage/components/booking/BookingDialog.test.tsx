import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { booking } from "../../content";
import { BookingDialog } from "./BookingDialog";

const { steps, errors } = booking;

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

// A closed <dialog> is hidden from role queries, so include hidden ones.
const dialog = () => screen.getByRole("dialog", { hidden: true });
const open = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole("link", { name: "Book a Free Demo Class" }));

async function fillChild(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(booking.kid.label), "Aarav");
  await user.type(screen.getByLabelText(booking.grade.label), "Grade 3");
  await user.click(screen.getByRole("button", { name: /Reading & Spelling/ }));
  await user.click(screen.getByRole("button", { name: booking.continue }));
}

describe("BookingDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 24, 10, 0)); // Thursday 24 September 2026
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

  it("walks through both steps with inline errors, then confirms a call-back", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);

    await user.click(screen.getByRole("button", { name: booking.continue }));
    expect(screen.getByRole("alert")).toHaveTextContent(errors.kid);

    await fillChild(user);
    expect(screen.getByRole("heading", { name: steps[1].title })).toBeInTheDocument();
    expect(screen.getByText("Aarav")).toBeInTheDocument();

    await user.type(screen.getByLabelText(booking.parent.label), "Meera Iyer");
    await user.type(screen.getByLabelText(booking.phone.label), "12345");
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.call) }));
    expect(screen.getByRole("alert")).toHaveTextContent(errors.phone);

    await user.clear(screen.getByLabelText(booking.phone.label));
    await user.type(screen.getByLabelText(booking.phone.label), "9876543210");
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.call) }));
    expect(screen.getByRole("alert")).toHaveTextContent(errors.consent);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.call) }));

    expect(screen.getByRole("heading", { name: booking.done.title.replace("{parent}", "Meera") })).toBeInTheDocument();
    expect(dialog()).toHaveTextContent("+91 98765 43210");
  });

  it("goes back to step 1 with the answers kept", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);

    await user.click(screen.getByRole("button", { name: booking.edit }));

    expect(screen.getByLabelText(booking.kid.label)).toHaveValue("Aarav");
    expect(screen.getByRole("button", { name: /Reading & Spelling/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("schedules a demo on a picked day and slot", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await fillChild(user);
    await user.type(screen.getByLabelText(booking.parent.label), "Meera Iyer");
    await user.type(screen.getByLabelText(booking.phone.label), "9876543210");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /\+ Tamil/ }));

    await user.click(screen.getByRole("radio", { name: new RegExp(booking.mode.schedule.title) }));
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.schedule) }));
    expect(screen.getByRole("alert")).toHaveTextContent(errors.slot);

    const days = within(screen.getByRole("group", { name: /September 2026/ }));
    expect(days.getByRole("button", { name: /Sunday, 27 September/ })).toBeDisabled();
    await user.click(days.getByRole("button", { name: /Saturday, 26 September/ }));
    await user.click(screen.getByRole("button", { name: "10:30 AM" }));
    await user.click(screen.getByRole("button", { name: new RegExp(booking.submit.schedule) }));

    expect(dialog()).toHaveTextContent(/26 Sept? at 10:30 AM/);
    expect(dialog()).toHaveTextContent("English + Tamil");
  });

  it("closes with the close button and keeps unfinished answers for next time", async () => {
    const user = userEvent.setup();
    renderWithTrigger();
    await open(user);
    await user.type(screen.getByLabelText(booking.kid.label), "Aarav");
    await user.click(screen.getByRole("button", { name: booking.close }));
    expect(dialog()).not.toHaveAttribute("open");

    await open(user);
    expect(screen.getByLabelText(booking.kid.label)).toHaveValue("Aarav"); // kept while unfinished
  });

  it("has no axe violations on either step", async () => {
    const user = userEvent.setup();
    const { container } = renderWithTrigger();
    await open(user);
    expect(await axeViolations(container)).toEqual([]);
    await fillChild(user);
    expect(await axeViolations(container)).toEqual([]);
  });
});
