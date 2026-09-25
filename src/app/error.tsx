"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorShell } from "@/features/errors/components/ErrorShell";
import { routeError } from "@/features/errors/content";
import { followWithFullLoad } from "@/features/errors/full-load";

export type RouteErrorProps = {
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the segment (Next 16; preferred over `reset`). */
  retry: () => void;
};

/**
 * Fallback for errors thrown while rendering a route below the root layout. Widgets on the
 * page have their own boundaries (components/errors/WidgetBoundary), so this shows only when
 * the page itself fails. Never shows the raw message or stack; production server errors only
 * carry `digest`. "Try again" re-renders in place; the links load a fresh document.
 */
export default function RouteError({ error, retry }: RouteErrorProps) {
  useEffect(() => {
    // TODO(product): forward to an error-monitoring service once one is chosen.
    console.error(error);
  }, [error]);

  useEffect(() => {
    // The page just vanished under the user; move focus to the message so it's announced.
    document.getElementById("main")?.focus();
  }, []);

  return (
    <ErrorShell kicker={routeError.kicker} heading={routeError.heading} body={routeError.body}>
      <Button onClick={() => retry()} size="mdEven">
        {routeError.retry}
      </Button>
      {/* `contents`: the wrapper only listens for clicks; the links stay in the shell's row. */}
      <div onClickCapture={followWithFullLoad} className="contents">
        <Button href={routeError.home.href} variant="ghost" size="mdEven">
          {routeError.home.label}
        </Button>
        <Button href={routeError.cta.href} variant="ghost" size="mdEven">
          {routeError.cta.label}
        </Button>
      </div>
    </ErrorShell>
  );
}
