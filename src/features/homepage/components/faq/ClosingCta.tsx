import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { closingCta } from "../../content/faq";

const glow = "pointer-events-none absolute z-0 rounded-full blur-[60px]";

/** The midnight "Ready to See Where Your Child Stands?" bar that closes the FAQ (`#cta`, `.end-bar`). */
export function ClosingCta() {
  return (
    <Container id={closingCta.id} className="relative z-2 mt-[72px]">
      <div className="relative isolate overflow-hidden rounded-[28px] border border-white/12 bg-midnight shadow-[0_0_0_6px_rgba(11,20,51,.06),0_36px_70px_-34px_rgba(11,20,51,.75)]">
        <span aria-hidden="true" className={cn(glow, "-top-[120px] -left-[100px] h-[240px] w-[340px] bg-[rgba(21,87,214,.55)]")} />
        <span aria-hidden="true" className={cn(glow, "-top-[60px] -right-20 h-[240px] w-[320px] bg-[rgba(124,58,237,.45)]")} />
        <span aria-hidden="true" className={cn(glow, "-bottom-[150px] left-[45%] h-[200px] w-[280px] bg-[rgba(208,51,95,.35)]")} />
        <div className="relative z-1 flex flex-wrap items-center gap-[18px] px-[18px] pt-[18px] pb-4 sm:pt-5 sm:pr-[22px] sm:pb-[18px] sm:pl-5 md:flex-nowrap">
          <span className="flex size-[54px] flex-none items-center justify-center rounded-2xl bg-white shadow-[0_0_0_4px_rgba(255,255,255,.08)]">
            <Image src={closingCta.mark.src} alt="" width={closingCta.mark.width} height={closingCta.mark.height} sizes="24px" className="block h-[26px] w-auto" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-[clamp(19px,1.7vw,23px)] font-extrabold tracking-[-.02em] text-white">{closingCta.title}</h2>
            <p className="mt-[3px] text-body text-mist">{closingCta.body}</p>
          </div>
          <Button href={closingCta.cta.href} action="book" variant="halo" arrow className="w-full flex-none justify-between md:w-auto md:justify-start">
            {closingCta.cta.label}
          </Button>
        </div>
        <div className="relative z-1 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-dashed border-white/14 bg-white/4 px-[18px] py-3 sm:px-[22px] sm:py-[11px]">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {closingCta.chips.map((chip) => (
              <span key={chip} className="inline-flex items-center gap-[5px] text-fine font-bold text-haze">
                <Icon name="check" size={12} strokeWidth={3} className="text-tone-mint-light" />
                {chip}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {closingCta.seals.map((seal) => (
              <div key={seal.id} className="flex items-center gap-2 text-[12px] text-mist">
                <span className="flex size-10 flex-none items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_2px_rgba(255,255,255,.15)]">
                  <Image
                    src={seal.logo.src}
                    alt={seal.logo.alt}
                    width={seal.logo.width}
                    height={seal.logo.height}
                    sizes="34px"
                    className={seal.id === "actd" ? "block size-7 object-contain" : "block size-[34px]"}
                  />
                </span>
                <span>
                  <b className="font-extrabold text-white">{seal.name}</b>
                  {seal.caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
