import Image from "next/image";
import { hero } from "../content";
import type { HeroTag } from "../types";
import { HeroCanvas } from "./HeroCanvas";
import { Pulse } from "./Pulse";

const dotColors: Record<HeroTag["dot"], string> = {
  blue: "bg-[#2563EB] text-[#2563EB]",
  amber: "bg-[#D97706] text-[#D97706]",
  violet: "bg-[#7C3AED] text-[#7C3AED]",
  cyan: "bg-[#0891B2] text-[#0891B2]",
};

/** Hero photo + neural-net canvas + floating skill tags (tags hidden on phones). */
export function HeroArtwork() {
  return (
    <div className="relative aspect-[1672/941] overflow-hidden [container-type:size] lg:absolute lg:inset-0 lg:aspect-auto">
      <div className="hero-art">
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          preload
          sizes="(min-width: 1001px) 90vw, 100vw"
          className="object-cover object-top"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 h-[120px] bg-linear-to-b from-cream/0 to-cream" />
      <HeroCanvas />
      <div className="hero-art z-3 max-sm:hidden">
        {hero.tags.map((tag) => (
          <div
            key={tag.id}
            tabIndex={0}
            aria-describedby={`hero-tip-${tag.id}`}
            className="group absolute z-3 animate-floaty-fast [transform:translate(-50%,-50%)] outline-none hover:[animation-play-state:paused] focus-visible:[animation-play-state:paused]"
            style={{ left: tag.x, top: tag.y }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/85 py-2 pr-3.5 pl-[11px] text-meta font-bold whitespace-nowrap text-ink shadow-[0_10px_30px_-14px_rgba(14,26,58,.35)] backdrop-blur-[10px] group-focus-visible:outline-3 group-focus-visible:outline-offset-2 group-focus-visible:outline-brand/35">
              <Pulse className={dotColors[tag.dot]} />
              {tag.label}
            </span>
            <span
              id={`hero-tip-${tag.id}`}
              role="tooltip"
              className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 w-[210px] -translate-x-1/2 -translate-y-1 rounded-[14px] bg-ink px-3.5 py-3 text-left text-fine leading-[1.5] text-[#E4E8F5] opacity-0 transition-all duration-250 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            >
              {tag.tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
