import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { IconTile } from "@/components/ui/IconTile";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { community } from "../content/community";
import { SpellzeeWord } from "../components/SpellzeeWord";
import { WaveDivider } from "../components/WaveDivider";

const COPIES = [0, 1, 2, 3];

/** "10,000+ Families": heading and CTA, three drifting rows of family photos, then the headline numbers. */
export function CommunitySection() {
  const { title } = community;
  return (
    <section className="silk relative overflow-hidden bg-center pt-[88px] pb-[110px] sm:pt-[110px] sm:pb-[150px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-1 h-[220px] bg-linear-to-b from-cream to-cream/0" />
      <Container className="relative z-2">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <Kicker>{community.kicker}</Kicker>
            <Heading className="mt-4">
              {title.before}
              <Swoosh size="xl">
                <SpellzeeWord />
                {title.after}
              </Swoosh>
              {title.end}
            </Heading>
            <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5 max-w-[560px]">
              {community.lead}
            </Lead>
          </div>
          <Button href={community.cta.href} action="book" arrow>
            {community.cta.label}
          </Button>
        </div>
      </Container>

      <div
        role="group"
        aria-label={community.photosLabel}
        className="relative z-2 mt-11 flex flex-col gap-3 [mask-image:linear-gradient(90deg,transparent_0,#000_7%,#000_93%,transparent_100%)]"
      >
        {community.strips.map((strip) => (
          <div key={strip.id} className="group overflow-hidden">
            <div
              className={cn(
                "flex w-max gap-3 group-hover:[animation-play-state:paused]",
                strip.direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
              )}
              style={{ animationDuration: strip.duration }}
            >
              {COPIES.map((copy) => (
                <Image
                  key={copy}
                  src={strip.image.src}
                  alt={copy === 0 ? strip.image.alt : ""}
                  aria-hidden={copy === 0 ? undefined : true}
                  width={strip.image.width}
                  height={strip.image.height}
                  sizes="(min-width: 1001px) 2731px, 1877px"
                  className="block h-[clamp(110px,11vw,160px)] w-auto flex-none rounded-[14px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Container className="relative z-2">
        <ul className="mt-8 grid grid-cols-2 gap-y-3 rounded-[24px] border border-white bg-white/80 px-1 py-3.5 shadow-[0_0_0_1px_rgba(150,120,90,.10),0_24px_48px_-32px_rgba(70,45,20,.45)] backdrop-blur-[14px] sm:grid-cols-3 sm:gap-y-3.5 sm:px-2 sm:py-4 lg:grid-cols-5">
          {community.stats.map((stat, i) => (
            <li
              key={stat.id}
              className={cn(
                tones[stat.tone],
                "flex items-center gap-2.5 border-line-soft px-3 py-1 sm:gap-3 sm:px-5",
                // The export's separators: every stat after the first, except the third on tablets.
                i > 0 && "sm:border-l",
                i === 2 && "sm:max-lg:border-l-0",
              )}
            >
              <IconTile icon={stat.icon} tone={stat.tone} box={44} iconSize={20} className="max-sm:size-[38px]" />
              <div>
                <div className="text-[20px] leading-[1.1] font-extrabold tracking-[-0.02em] text-(--tone) sm:text-[24px]">{stat.value}</div>
                <div className="mt-0.5 text-meta text-muted">{stat.label}</div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
      <WaveDivider id="wave-community-bottom" position="bottom" />
    </section>
  );
}
