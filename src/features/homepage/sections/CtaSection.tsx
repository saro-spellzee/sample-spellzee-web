import { Accent } from "@/components/ui/Accent";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { cta } from "../content";

/** Closing navy CTA band with decorative flowing lines (hidden below desktop). */
export function CtaSection() {
  return (
    <section id="cta" className="py-[100px]">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-14 py-[76px] text-center text-white">
          <svg
            viewBox="0 0 1100 360"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className="absolute inset-0 hidden size-full opacity-50 lg:block"
          >
            <g fill="none" strokeWidth="1.2">
              <path d="M-20 300 C 200 180, 300 360, 520 250" stroke="#2F6BF2" />
              <path d="M1120 60 C 900 180, 800 0, 600 110" stroke="#8B4FE8" />
              <path d="M-20 60 C 150 120, 220 20, 380 90" stroke="#E0316F" opacity="0.7" />
              <path d="M1120 300 C 950 240, 900 340, 740 280" stroke="#12A57A" opacity="0.7" />
            </g>
            <g>
              <circle cx="520" cy="250" r="4" fill="#2F6BF2" />
              <circle cx="600" cy="110" r="4" fill="#8B4FE8" />
              <circle cx="380" cy="90" r="3.5" fill="#E0316F" />
              <circle cx="740" cy="280" r="3.5" fill="#12A57A" />
            </g>
          </svg>
          <div className="relative">
            <Heading size="text-[44px] leading-[1.08] tracking-[-0.035em]" color="text-white" className="mx-auto max-w-[760px]">
              {cta.title.before}
              <Accent className="text-[1.1em] text-periwinkle">{cta.title.accent}</Accent>
            </Heading>
            <p className="mx-auto mt-4 max-w-[540px] text-[17px] leading-[1.6] text-haze">{cta.body}</p>
            <Button href={cta.button.href} arrow className="mt-8">
              {cta.button.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
