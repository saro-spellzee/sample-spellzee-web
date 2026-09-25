import Image from "next/image";
import Link from "next/link";
import { WidgetBoundary } from "@/components/errors/WidgetBoundary";
import { Accent } from "@/components/ui/Accent";
import { Container } from "@/components/ui/Container";
import { footer } from "../content/footer";
import { widgetError } from "../content/page";
import { NewsletterForm } from "../components/NewsletterForm";

const pill = "rounded-full border border-night-line text-fine text-haze";

export function HomeFooter() {
  const { newsletter, badges } = footer;
  return (
    <footer className="bg-night pt-20 pb-[34px] text-white">
      <Container>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10">
          {/* Spans two tracks, as in the export (on phones that adds a column for the link lists).
              Below the export's 360px minimum that no longer fits, so it takes the full row. */}
          <div className="col-span-full max-w-[420px] 2xs:col-span-2">
            <div className="flex items-center gap-3">
              <Image src={footer.mark.src} alt="" width={footer.mark.width} height={footer.mark.height} sizes="37px" className="block h-10 w-auto" />
              <span className="text-[25px] font-extrabold tracking-[-0.03em]">{footer.brand}</span>
            </div>
            <p className="mt-4 text-[17px] font-bold">
              {footer.tagline.before}
              <Accent className="text-[1.15em] text-periwinkle">{footer.tagline.accent}</Accent>
            </p>
            <p className="mt-2 text-body leading-[1.6] text-mist">{footer.blurb}</p>
            <div className="mt-6">
              <div className="text-[15px] font-extrabold">{newsletter.title}</div>
              <div className="mt-1 text-[13.5px] text-mist">{newsletter.body}</div>
              <WidgetBoundary name="Newsletter form" notice={widgetError} className="mt-3.5">
                <NewsletterForm />
              </WidgetBoundary>
            </div>
          </div>
          {footer.columns.map((col) => (
            <nav key={col.id} aria-labelledby={`footer-${col.id}`}>
              <div id={`footer-${col.id}`} className="text-[12px] font-bold tracking-[0.16em] text-dusk uppercase">
                {col.title}
              </div>
              <ul className="mt-[18px] flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="block text-[14px] text-mist no-underline hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <ul className="mt-[52px] flex flex-wrap gap-2.5 border-t border-[#1E2B55] pt-[26px]">
          <li className={`${pill} inline-flex items-center gap-2.5 py-[5px] pr-3.5 pl-[5px]`}>
            <Image src={badges.iitm.logo.src} alt={badges.iitm.logo.alt} width={badges.iitm.logo.width} height={badges.iitm.logo.height} sizes="30px" className="block size-[30px]" />
            {badges.iitm.label}
          </li>
          <li className={`${pill} inline-flex items-center gap-2.5 py-[5px] pr-3.5 pl-[5px]`}>
            <span className="flex size-[30px] items-center justify-center overflow-hidden rounded-full bg-white">
              <Image src={badges.actd.logo.src} alt={badges.actd.logo.alt} width={badges.actd.logo.width} height={badges.actd.logo.height} sizes="24px" className="block size-6 object-contain" />
            </span>
            {badges.actd.label}
          </li>
          {badges.plain.map((label) => (
            <li key={label} className={`${pill} px-[13px] py-[7px]`}>
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-[26px] flex flex-wrap justify-between gap-3 text-meta text-dusk">
          <span>{footer.copyright}</span>
          <span>{footer.company}</span>
        </div>
      </Container>
    </footer>
  );
}
