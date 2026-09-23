import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { ErrorShell } from "@/features/errors/components/ErrorShell";
import { notFound } from "@/features/errors/content";

// Next adds `noindex` automatically for 404 responses.
export const metadata: Metadata = { title: notFound.title };

/** Unmatched URLs and `notFound()` calls. Static: no request APIs, so it prerenders. */
export default function NotFound() {
  return (
    <ErrorShell kicker={notFound.kicker} heading={notFound.heading} body={notFound.body}>
      <Button href={notFound.cta.href} arrow>
        {notFound.cta.label}
      </Button>
      <Button href={notFound.home.href} variant="ghost" size="mdEven">
        {notFound.home.label}
      </Button>
    </ErrorShell>
  );
}
