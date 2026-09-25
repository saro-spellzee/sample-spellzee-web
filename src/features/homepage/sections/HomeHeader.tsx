import Image from "next/image";
import Link from "next/link";
import { WidgetBoundary } from "@/components/errors/WidgetBoundary";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { header } from "../content/page";
import { HeaderShell } from "../components/HeaderShell";

/**
 * Skip link + sticky header. Nav links hide below the desktop breakpoint, where a menu button takes over.
 * If the header's script fails, a plain bar with the same logo, nav and CTA takes its place.
 */
export function HomeHeader() {
  const brand = (
    <Link href={header.homeHref} aria-label={header.logo.alt} className="flex items-center no-underline">
      <Image
        src={header.logo.src}
        alt={header.logo.alt}
        width={header.logo.width}
        height={header.logo.height}
        loading="eager"
        sizes="140px"
        className="block h-10 w-auto"
      />
    </Link>
  );
  const nav = (
    <nav aria-label={header.navLabel} className="hidden gap-[30px] lg:flex">
      {header.nav.map((item) => (
        <Link key={item.href} href={item.href} className="text-body font-semibold text-slate no-underline hover:text-brand">
          {item.label}
        </Link>
      ))}
    </nav>
  );
  const cta = (
    <Button href={header.cta.href} size="sm" action="book" className="max-sm:hidden">
      {header.cta.label}
    </Button>
  );
  return (
    <>
      {/* Skip link: first tab stop, visible only while focused. */}
      <a
        href={header.skipLink.href}
        className="sr-only rounded-full bg-ink px-5 py-3 text-sm font-bold text-white no-underline focus:not-sr-only focus:px-5 focus:py-3 focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:outline-3 focus:outline-offset-2 focus:outline-brand hover:text-white"
      >
        {header.skipLink.label}
      </a>
      <WidgetBoundary
        name="Site header"
        fallback={
          <header className="border-b border-[rgba(160,130,100,0.12)] bg-cream">
            <Container className="flex h-16 items-center justify-between gap-6 sm:h-[74px]">
              {brand}
              {nav}
              {cta}
            </Container>
          </header>
        }
      >
        <HeaderShell brand={brand} nav={nav} cta={cta} />
      </WidgetBoundary>
    </>
  );
}
