import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { IconTile } from "@/components/ui/IconTile";
import { Lead } from "@/components/ui/Lead";
import { hero } from "../content";
import { CredentialBar } from "./CredentialBar";
import { HeroWordRotator } from "./HeroWordRotator";
import { LanguageRotator } from "./LanguageRotator";
import { MiniBadge } from "./MiniBadge";

export function HeroCopy() {
  const { badges, title, lead, highlights, language } = hero;
  return (
    <div
      data-hero-copy
      className="relative z-4 order-first animate-rise px-5 pt-7 pb-2 sm:px-7 sm:pt-12 sm:pb-3 lg:order-none lg:ml-[max(40px,calc((100%-1200px)/2+40px))] lg:w-[min(46%,600px)] lg:px-0 lg:pt-9 lg:pb-[84px]"
    >
      <div className="flex flex-wrap gap-2.5">
        <MiniBadge pulse>
          {badges.method.before}
          <b className="font-extrabold text-tone-iris">{badges.method.strong}</b>
          {badges.method.after}
        </MiniBadge>
        <MiniBadge pulse>{badges.incubated}</MiniBadge>
      </div>

      <Heading as="h1" look="display" size="text-[40px] leading-[1.08] tracking-[-0.045em] sm:text-[clamp(36px,3.5vw,54px)]" className="mt-[18px]">
        <span className="sr-only">{title.spoken}</span>
        <span aria-hidden="true">
          {title.line}
          <br />
          <HeroWordRotator />
        </span>
      </Heading>

      <Lead className="mt-[22px] max-w-[540px]">
        {lead.before}
        <strong className="font-bold text-ink">{lead.strong}</strong>
        {lead.middle}
        <strong className="font-bold text-ink">{lead.strong2}</strong>
        {lead.after}
      </Lead>

      <ul className="mt-[22px] flex flex-wrap items-center gap-x-[18px] gap-y-2.5 text-[13.5px] font-bold text-ink-2">
        {highlights.map((item) => (
          <li key={item.id} className="inline-flex items-center gap-[9px]">
            <IconTile icon={item.icon} tone={item.tone} box={28} iconSize={15} strokeWidth={2.2} />
            <span>
              {"highlight" in item ? <span className="text-brand">{item.highlight}</span> : null}
              {item.label}
            </span>
          </li>
        ))}
        <li className="inline-flex items-center gap-[9px]">
          <IconTile icon={language.icon} tone={language.tone} box={28} iconSize={15} strokeWidth={2.2} />
          <span>
            {language.label} <LanguageRotator />
          </span>
        </li>
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={hero.primaryCta.href} action="book" arrow>
          {hero.primaryCta.label}
        </Button>
        <Button href={hero.secondaryCta.href} variant="ghost" size="mdEven">
          {hero.secondaryCta.label}
        </Button>
      </div>

      <div className="mt-[26px]">
        <CredentialBar />
      </div>
    </div>
  );
}
