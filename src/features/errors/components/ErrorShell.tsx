import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { site } from "@/lib/site";
import { errorShell } from "../content";

export type ErrorShellProps = {
  kicker: string;
  heading: string;
  body: string;
  /** Recovery actions (buttons/links). */
  children: ReactNode;
};

/**
 * Branded frame for the 404 and error screens: logo home link, heading, message and
 * recovery actions. Renders inside the root layout, so site fonts and tokens apply.
 * Server-safe: used by both not-found.tsx (server) and error.tsx (client).
 */
export function ErrorShell({ kicker, heading, body, children }: ErrorShellProps) {
  return (
    <div className="flex min-h-svh min-w-90 flex-col bg-cream">
      <header className="border-b border-line">
        <Container className="flex h-[74px] items-center">
          <Link href="/" aria-label={errorShell.homeLabel} className="flex items-center no-underline">
            <Image
              src={site.logo.src}
              alt={site.name}
              width={site.logo.width}
              height={site.logo.height}
              loading="eager"
              sizes="140px"
              className="block h-10 w-auto"
            />
          </Link>
        </Container>
      </header>
      <main id="main" tabIndex={-1} aria-labelledby="error-title" className="flex flex-1 items-center py-20 outline-none">
        <Container className="w-full text-center">
          <Kicker>{kicker}</Kicker>
          <Heading
            as="h1"
            id="error-title"
            look="display"
            size="text-[40px] leading-[1.08] tracking-[-0.04em] sm:text-[52px]"
            className="mx-auto mt-6 max-w-[720px] text-balance"
          >
            {heading}
          </Heading>
          <Lead className="mx-auto mt-5 max-w-[560px]">{body}</Lead>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
        </Container>
      </main>
    </div>
  );
}
