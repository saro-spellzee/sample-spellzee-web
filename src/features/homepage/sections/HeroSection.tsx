import { HeroArtwork } from "../components/HeroArtwork";
import { HeroCopy } from "../components/HeroCopy";
import { HeroLedger } from "../components/HeroLedger";

/**
 * Hero. Desktop: copy on the left over a full-bleed artwork that fills the
 * viewport height. Tablet/phone: copy first, artwork below at its natural ratio.
 * `data-hero-host` / `data-hero-copy` let the canvas find its pointer host and
 * the copy box (it keeps neurons out from under the text).
 */
export function HeroSection() {
  return (
    <section id="top" className="relative flex flex-col bg-cream lg:min-h-[calc(100vh-75px)]">
      <div
        data-hero-host
        className="relative flex w-full flex-col items-stretch lg:min-h-[560px] lg:flex-[1_0_auto] lg:flex-row lg:items-center"
      >
        {/* Copy first in the DOM so focus order follows reading order; layout order is set with CSS. */}
        <HeroCopy />
        <HeroArtwork />
      </div>
      <HeroLedger />
    </section>
  );
}
