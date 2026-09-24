import { Container } from "@/components/ui/Container";
import { IconTile } from "@/components/ui/IconTile";
import { hero } from "../content";

/** Frosted guarantee strip overlapping the bottom of the hero. */
export function HeroLedger() {
  return (
    <div className="relative z-6 -mt-[54px] pb-7">
      <Container>
        <ul className="grid grid-cols-1 rounded-[24px] border border-white bg-white/80 px-1.5 py-[18px] shadow-[0_34px_70px_-40px_rgba(70,45,20,0.4),inset_0_2px_0_rgba(255,255,255,0.8)] backdrop-blur-[18px] backdrop-saturate-[1.2] sm:grid-cols-2 lg:grid-cols-4">
          {hero.ledger.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3.5 border-line-soft px-3.5 py-2.5 lg:border-l lg:px-[18px] lg:py-0.5 lg:first:border-l-0"
            >
              <IconTile icon={item.icon} tone={item.tone} box={38} />
              <div className="text-body font-extrabold whitespace-nowrap">{item.title}</div>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
