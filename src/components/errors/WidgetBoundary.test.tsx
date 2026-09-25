import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../tests/axe";
import { WidgetBoundary } from "./WidgetBoundary";

const notice = { message: "This part of the page didn’t load.", retry: "Try again" };

/** Throws while rendering for as long as `failing.now` is true. */
const failing = { now: true };
function Flaky() {
  if (failing.now) throw new Error("widget broke");
  return <p>Widget content</p>;
}

/** Throws from an effect, the way a missing browser API fails. */
function BrokenEffect() {
  useEffect(() => {
    throw new Error("effect broke");
  }, []);
  return <p>Never kept</p>;
}

function Section({ children }: { children: ReactNode }) {
  return (
    <section>
      <h2>Section heading</h2>
      {children}
      <p>Section footer</p>
    </section>
  );
}

afterEach(() => {
  failing.now = true;
  vi.restoreAllMocks();
});

describe("WidgetBoundary", () => {
  it("keeps the rest of the section when a widget throws, reports it, and renders it again on Try again", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <Section>
        <WidgetBoundary name="Skill map" notice={notice}>
          <Flaky />
        </WidgetBoundary>
      </Section>,
    );

    expect(screen.getByRole("heading", { name: "Section heading" })).toBeInTheDocument();
    expect(screen.getByText("Section footer")).toBeInTheDocument();
    expect(screen.getByText(notice.message)).toBeInTheDocument();
    expect(container).not.toHaveTextContent("widget broke");
    expect(log).toHaveBeenCalledWith("Skill map failed:", expect.objectContaining({ message: "widget broke" }));
    expect(await axeViolations(container)).toEqual([]);

    failing.now = false;
    await userEvent.click(screen.getByRole("button", { name: notice.retry }));
    expect(await screen.findByText("Widget content")).toBeInTheDocument();
    expect(screen.queryByText(notice.message)).not.toBeInTheDocument();
  });

  it("catches a throw from an effect, and a decorative widget just drops out", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Section>
        <WidgetBoundary name="Hero canvas">
          <BrokenEffect />
        </WidgetBoundary>
      </Section>,
    );

    expect(screen.queryByText("Never kept")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Section footer")).toBeInTheDocument();
    expect(log).toHaveBeenCalledWith("Hero canvas failed:", expect.objectContaining({ message: "effect broke" }));
  });

  it("shows a server-rendered stand-in in the widget's place", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <WidgetBoundary name="Hero word rotator" fallback={<span>Confidently.</span>}>
        <Flaky />
      </WidgetBoundary>,
    );
    expect(screen.getByText("Confidently.")).toBeInTheDocument();
  });

  it("renders the widget untouched when nothing fails", () => {
    failing.now = false;
    render(
      <WidgetBoundary name="Skill map" notice={notice} fallback={<span>stand-in</span>}>
        <Flaky />
      </WidgetBoundary>,
    );
    expect(screen.getByText("Widget content")).toBeInTheDocument();
    expect(screen.queryByText("stand-in")).not.toBeInTheDocument();
    expect(screen.queryByText(notice.message)).not.toBeInTheDocument();
  });
});
