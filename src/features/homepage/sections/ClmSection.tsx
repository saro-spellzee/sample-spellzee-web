import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { clm } from "../content";
import { ClmStepChips } from "../components/ClmStepChips";
import { SkillMap } from "../components/SkillMap";
import { WaveDivider } from "../components/WaveDivider";

export function ClmSection() {
  const { badge, title, tagline, intro, closing } = clm;
  return (
    <section id="clm" className="silk-lavender relative overflow-hidden pt-[112px] pb-[132px]">
      <WaveDivider id="wave-clm-top" position="top" />
      <Container className="relative z-2">
        <div className="mx-auto max-w-[900px] text-center">
          <div className="gradient-border inline-flex items-center gap-3 rounded-full py-1.5 pr-5 pl-1.5 shadow-[0_14px_34px_-18px_rgba(124,77,232,.55)]">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_#ECE4D9,0_0_0_4px_rgba(139,92,246,.1)]"
            >
              <Image src={badge.mark.src} alt="" width={badge.mark.width} height={badge.mark.height} sizes="21px" className="block h-[22px] w-auto" />
            </span>
            <span className="text-body font-bold tracking-[.01em] text-ink">
              {badge.before}
              <span className="text-gradient font-extrabold">{badge.highlight}</span>
              {badge.after}
            </span>
          </div>
          <Heading look="display" size="text-[clamp(34px,4vw,56px)] leading-none tracking-[-0.045em]" className="mt-4 lg:whitespace-nowrap">
            {title.before}
            <span className="text-gradient">{title.highlight}</span>
            <sup className="static align-super text-[0.3em]">{title.trademark}</sup>
          </Heading>
          <p className="mt-2.5 text-[clamp(20px,1.8vw,24px)] leading-[1.25] font-bold tracking-[-0.02em] text-ink">
            {tagline.before}
            <Swoosh size="lg">{tagline.mark}</Swoosh>
          </p>
          <Lead size="text-[16px] leading-[1.7]" className="mx-auto mt-3.5 max-w-[760px]">
            {intro.before}
            <strong className="font-bold text-ink">{intro.strong}</strong>
            {intro.after}
          </Lead>
        </div>

        <SkillMap />

        <ClmStepChips className="mt-[30px] justify-center gap-2.5" size="lg" arrows />
        <p className="mt-4 text-center text-[17px] font-medium text-slate">
          {closing.before}
          <strong className="font-extrabold text-ink">{closing.strong}</strong>
          {closing.after}
        </p>
        <div className="mt-[26px] text-center">
          <Button href={clm.cta.href} arrow>
            {clm.cta.label}
          </Button>
        </div>
      </Container>
      <WaveDivider id="wave-clm-bottom" position="bottom" />
    </section>
  );
}
