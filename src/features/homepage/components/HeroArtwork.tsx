import Image from "next/image";
import { WidgetBoundary } from "@/components/errors/WidgetBoundary";
import { hero } from "../content/hero";
import { HeroCanvas } from "./HeroCanvas";
import { HeroTags } from "./HeroTags";

/**
 * Hero photo + neural-net canvas + floating skill tags (tags hidden on phones). Both overlays
 * are decorative: if one fails, it drops out and the photo stays.
 */
export function HeroArtwork() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden [container-type:size] lg:absolute lg:inset-0 lg:aspect-auto">
      <div className="hero-art">
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          // LCP image: high fetch priority + eager (Next 16 recommends this over `preload`,
          // whose <link> carries no fetchpriority and competes with other preloads).
          loading="eager"
          fetchPriority="high"
          // Below the desktop breakpoint the 4:3 box crops the photo, which renders ~133% of the box width.
          sizes="(min-width: 1001px) 90vw, 134vw"
          className="object-cover object-top"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 h-[120px] bg-linear-to-b from-cream/0 to-cream" />
      <WidgetBoundary name="Hero canvas">
        <HeroCanvas />
      </WidgetBoundary>
      <WidgetBoundary name="Hero tags">
        <HeroTags />
      </WidgetBoundary>
    </div>
  );
}
