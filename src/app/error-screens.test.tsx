import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../tests/axe";
import { globalError, notFound, routeError } from "@/features/errors/content";
import RouteError from "./error";
import GlobalError from "./global-error";
import NotFound from "./not-found";

describe("not-found", () => {
  it("explains the 404 and links home and to booking", async () => {
    const { container } = render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: notFound.heading })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: notFound.home.label })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: notFound.cta.label })).toHaveAttribute("href", "/#book");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("error boundary", () => {
  it("offers retry, never shows the raw error, and reports it", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    const error = new Error("secret internal detail");
    const { container } = render(<RouteError error={error} retry={retry} />);

    expect(screen.getByRole("heading", { level: 1, name: routeError.heading })).toBeInTheDocument();
    expect(container).not.toHaveTextContent("secret internal detail");
    expect(log).toHaveBeenCalledWith(error);
    expect(screen.getByRole("main")).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: routeError.retry }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: routeError.home.label })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: routeError.cta.label })).toHaveAttribute("href", "/#book");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("global-error", () => {
  it("renders a self-contained document with no external resources", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const html = renderToStaticMarkup(<GlobalError error={new Error("root failed")} retry={() => {}} />);

    expect(html).toContain(`<html lang="en">`);
    expect(html).toContain(globalError.heading);
    expect(html).not.toContain("root failed");
    // Strict CSP: nothing that would need a font, script, stylesheet or data: image allowance.
    expect(html).not.toMatch(/<link|<script|<img|url\(|data:|@import|https?:\/\//);
    expect(html).toContain(`href="/"`);
    expect(html).toContain(`href="/#book"`);
  });
});
