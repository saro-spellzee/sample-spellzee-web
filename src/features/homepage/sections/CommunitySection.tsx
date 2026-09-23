import Image from "next/image";
import { Accent } from "@/components/ui/Accent";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { IconTile } from "@/components/ui/IconTile";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { community } from "../content";

const note = "absolute hidden font-hand text-[30px] leading-[1.05] font-medium text-ink lg:block";

export function CommunitySection() {
  const { notes, title, mosaic } = community;
  return (
    <section className="silk relative overflow-hidden bg-center pt-[110px] pb-[100px]">
      <div aria-hidden="true" className={cn(note, "top-[190px] left-[4%] -rotate-12")}>
        {notes.left.map((line, i) => (
          <span key={line}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
        <svg width="90" height="14" viewBox="0 0 90 14" className="mt-2 block">
          <path d="M2 10 Q 45 0 88 6" stroke="#1557D6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div aria-hidden="true" className={cn(note, "top-[200px] right-[4%] -rotate-10 text-right")}>
        <Icon name="star" size={30} strokeWidth={1.8} className="ml-auto block text-[#E0A817]" />
        {notes.right.map((line, i) => (
          <span key={line}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </div>

      <Container className="relative text-center">
        <Kicker>{community.kicker}</Kicker>
        <Heading look="display" size="text-[clamp(36px,4.2vw,54px)] leading-[1.1] tracking-[-0.035em]" className="mx-auto mt-4 max-w-[880px]">
          {title.line1}
          <br />
          {title.before}
          <Accent className="text-[1.12em] text-brand">{title.accent}</Accent>
          {title.after}
        </Heading>
        <Lead className="mx-auto mt-[18px] max-w-[620px]">{community.lead}</Lead>
        <ul className="mt-10 flex flex-wrap justify-center">
          {community.stats.map((s) => (
            <li key={s.id} className={cn(tones[s.tone], "flex items-center gap-3.5 border-l border-[#EADFCB] px-[26px] py-2 text-left first:border-l-0")}>
              <IconTile icon={s.icon} tone={s.tone} box={50} iconSize={22} />
              <div>
                <div className="text-[24px] font-extrabold tracking-[-0.02em] text-(--tone)">{s.value}</div>
                <div className="text-[13.5px] text-muted">{s.label}</div>
              </div>
            </li>
          ))}
        </ul>
        <Button href={community.cta.href} arrow className="mt-9">
          {community.cta.label}
        </Button>
      </Container>

      <div className="mx-auto mt-[52px] max-w-[1320px] px-6">
        <Image
          src={mosaic.src}
          alt={mosaic.alt}
          width={mosaic.width}
          height={mosaic.height}
          sizes="(min-width: 1320px) 1272px, 100vw"
          className="block h-auto w-full rounded-[18px] shadow-[0_30px_60px_-40px_rgba(14,26,58,0.5)]"
        />
      </div>

      <Container className="mt-11">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {community.trust.map((t) => (
            <li key={t.id} className="flex items-center justify-center gap-3.5">
              <IconTile icon={t.icon} tone={t.tone} box={50} iconSize={22} />
              <div>
                <div className="text-[15px] font-extrabold">{t.title}</div>
                <div className="text-meta text-muted">{t.description}</div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
