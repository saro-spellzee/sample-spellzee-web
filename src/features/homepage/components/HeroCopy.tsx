import { Accent } from "@/components/ui/Accent";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { IconTile } from "@/components/ui/IconTile";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { hero } from "../content";
import { CredentialBar } from "./CredentialBar";
import { Pulse } from "./Pulse";

const badge =
  "inline-flex items-center rounded-full border border-[#E3E8F4] bg-white/80 py-2 pr-4 text-meta font-bold";

export function HeroCopy() {
  const { badges, title, lead, highlights } = hero;
  return (
    <div
      data-hero-copy
      className="relative z-4 order-first animate-rise px-7 pt-12 pb-3 lg:order-none lg:ml-[max(40px,calc((100%-1200px)/2+40px))] lg:w-[min(46%,600px)] lg:px-0 lg:pt-9 lg:pb-[84px]"
    >
      <div className="flex flex-wrap gap-2.5">
        <span className={`${badge} gap-2.5 pl-3.5 text-brand`}>
          <Pulse className="bg-vivid-rose text-vivid-rose" />
          {badges.intro}
        </span>
        <span className={`${badge} gap-2 pl-3 text-ink`}>
          <Icon name="institution" size={15} />
          {badges.incubated}
        </span>
      </div>

      <Heading as="h1" look="display" size="text-[clamp(36px,3.6vw,52px)] leading-[1.08] tracking-[-0.045em]" className="mt-[18px]">
        {title.lines[0]}
        <br />
        {title.lines[1]}
        <br />
        {title.lines[2]}
        <Accent className="pl-[0.04em] text-[1.14em] text-brand">{title.accent}</Accent>
      </Heading>

      <Lead className="mt-5 max-w-[520px]">
        <strong className="font-bold text-ink">{lead.strong}</strong>
        {lead.middle}
        <Swoosh>{lead.mark}</Swoosh>
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
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={hero.primaryCta.href} arrow>
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
