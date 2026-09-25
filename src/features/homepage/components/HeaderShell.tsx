"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { header } from "../content/page";

const MENU_ID = "site-menu";

export type HeaderShellProps = {
  /** Logo link (server-rendered). */
  brand: ReactNode;
  /** Desktop nav (server-rendered, hidden below the desktop breakpoint). */
  nav: ReactNode;
  /** Header CTA (server-rendered, hidden on phones). */
  cta: ReactNode;
};

/**
 * Sticky frosted header. Below the desktop breakpoint a menu button opens the section
 * links under the bar (in the flow, as in the export). The menu closes on a link tap,
 * Escape, a tap outside the header, or keyboard focus moving on past it (the open menu
 * would otherwise stay stuck over the page). On short screens it scrolls within the viewport.
 */
export function HeaderShell({ brand, nav, cta }: HeaderShellProps) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.target instanceof Node && !headerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      onBlur={(e) => {
        // Only when focus lands on something else on the page, not when the window loses focus.
        if (open && e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      className="sticky top-0 z-50 border-b border-[rgba(160,130,100,0.12)] bg-[rgba(252,248,244,0.85)] backdrop-blur-[16px] backdrop-saturate-[1.2]"
    >
      <Container className="flex h-16 items-center justify-between gap-6 sm:h-[74px]">
        {brand}
        {nav}
        <div className="flex items-center gap-2.5">
          {cta}
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={MENU_ID}
            aria-label={header.menuLabel}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white bg-white/85 text-ink shadow-[0_0_0_1px_rgba(150,120,90,.14)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35 lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={20} strokeWidth={2.2} />
          </button>
        </div>
      </Container>
      <nav
        id={MENU_ID}
        aria-label={header.mobileNavLabel}
        hidden={!open}
        // Any link in the menu (a section or the booking CTA) closes it.
        onClick={(e) => {
          if (e.target instanceof Element && e.target.closest("a")) setOpen(false);
        }}
        className="flex max-h-[calc(100svh-4rem)] animate-fade-up flex-col gap-0.5 overflow-y-auto overscroll-contain border-t border-[rgba(160,130,100,0.12)] bg-[rgba(252,248,244,0.97)] px-5 pt-2.5 pb-[18px] sm:max-h-[calc(100svh-74px)] lg:hidden"
      >
        {header.nav.map((item) => (
          <Link key={item.href} href={item.href} className="border-b border-hairline px-1 py-3 text-[16px] font-bold text-ink no-underline hover:text-brand">
            {item.label}
          </Link>
        ))}
        <Button href={header.cta.href} action="book" className="mt-2 justify-center">
          {header.cta.label}
        </Button>
      </nav>
    </header>
  );
}
