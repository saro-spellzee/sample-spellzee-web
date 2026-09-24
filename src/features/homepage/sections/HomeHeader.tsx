import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { header } from "../content/page";
import { HeaderShell } from "../components/HeaderShell";

/** Skip link + sticky header. Nav links hide below the desktop breakpoint, where a menu button takes over. */
export function HomeHeader() {
  return (
    <>
      {/* Skip link: first tab stop, visible only while focused. */}
      <a
        href={header.skipLink.href}
        className="sr-only rounded-full bg-ink px-5 py-3 text-sm font-bold text-white no-underline focus:not-sr-only focus:px-5 focus:py-3 focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:outline-3 focus:outline-offset-2 focus:outline-brand hover:text-white"
      >
        {header.skipLink.label}
      </a>
      <HeaderShell
        brand={
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
        }
        nav={
          <nav aria-label={header.navLabel} className="hidden gap-[30px] lg:flex">
            {header.nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-body font-semibold text-slate no-underline hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>
        }
        cta={
          <Button href={header.cta.href} size="sm" action="book" className="max-sm:hidden">
            {header.cta.label}
          </Button>
        }
      />
    </>
  );
}
