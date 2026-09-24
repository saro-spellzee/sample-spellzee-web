import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { IconTile } from "@/components/ui/IconTile";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { oneOnOne } from "../content";
import { OneOnOneStage } from "../components/OneOnOneStage";
import { WaveDivider } from "../components/WaveDivider";

/** "Why 1:1 works": pitch on the left, mentor–child illustration and feature cards on the right. */
export function OneOnOneSection() {
  const { title } = oneOnOne;
  return (
    <section className="silk relative overflow-hidden bg-top py-[88px] sm:pt-[140px] sm:pb-[150px]">
      <WaveDivider id="wave-one-top" position="top" />
      <Container className="relative z-2 grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,.88fr)]">
        <div>
          <Kicker>{oneOnOne.kicker}</Kicker>
          <Heading
            size="text-[30px] leading-[1.2] tracking-[-0.035em] sm:text-[clamp(32px,3.1vw,44px)] sm:leading-[1.08]"
            className="mt-4 text-balance"
          >
            {title.before}
            <Swoosh size="xl">{title.mark}</Swoosh>
          </Heading>
          <p className="mt-6 text-[20px] font-bold text-ink">{oneOnOne.tagline}</p>
          <Lead size="text-[16.5px] leading-[1.65]" className="mt-2.5 max-w-[500px]">
            {oneOnOne.lead}
          </Lead>
          <ul className="mt-[30px] flex flex-col gap-3">
            {oneOnOne.assurances.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-body font-semibold text-ink-2">
                <IconTile icon={item.icon} tone={item.tone} box={30} iconSize={15} strokeWidth={2.4} />
                {item.title}
              </li>
            ))}
          </ul>
        </div>
        <OneOnOneStage />
      </Container>
      <WaveDivider id="wave-one-bottom" position="bottom" />
    </section>
  );
}
