import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { header } from "../content";

/** Sticky frosted header. Nav links hide below the desktop breakpoint, as in the export. */
export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(160,130,100,0.12)] bg-[rgba(252,248,244,0.85)] backdrop-blur-[16px] backdrop-saturate-[1.2]">
      <Container className="flex h-[74px] items-center justify-between gap-6">
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
        <nav aria-label={header.navLabel} className="hidden gap-[30px] lg:flex">
          {header.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-body font-semibold text-slate no-underline hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
        <Button href={header.cta.href} size="sm">
          {header.cta.label}
        </Button>
      </Container>
    </header>
  );
}
