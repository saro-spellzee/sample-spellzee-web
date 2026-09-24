import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { faq } from "../content";
import { FaqAccordion } from "../components/FaqAccordion";
import { ClosingCta } from "../components/faq/ClosingCta";
import { faqPanels } from "../components/faq/faqPanels";
import { WaveDivider } from "../components/WaveDivider";

/** FAQ: sticky intro and help card beside the accordion, then the closing call to action. */
export function FaqSection() {
  const { help } = faq;
  return (
    // overflow-x-clip, not overflow-hidden: a hidden overflow would stop the intro column sticking.
    <section id="faq" className="silk relative overflow-x-clip bg-bottom py-[88px] sm:pt-[140px] sm:pb-[110px]">
      <WaveDivider id="wave-faq-top" position="top" />
      <Container className="relative z-2 grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        {/* The export's overflow:hidden turns its sticky into a fixed 110px drop (the board shows the
            column 110px below the accordion's top). Keep that resting position and let it really stick. */}
        <div className="lg:sticky lg:top-[110px] lg:mt-[110px]">
          <Heading look="display" size="text-[clamp(38px,3.8vw,52px)] leading-[1.06] tracking-[-0.045em]">
            {faq.title.before}
            <Swoosh size="xl">{faq.title.mark}</Swoosh>
          </Heading>
          <Lead size="text-[16px] leading-[1.65]" className="mt-[18px] max-w-[360px]">
            {faq.lead}
          </Lead>
          <Card radius="rounded-[22px]" className="mt-7 max-w-[380px] p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex size-12 flex-none items-center justify-center rounded-full bg-tone-sky-soft text-brand">
                <Icon name="chat" size={22} />
              </span>
              <div>
                <h3 className="m-0 text-[16px] font-extrabold">{help.title}</h3>
                <div className="mt-[3px] text-[13.5px] leading-[1.5] text-muted">{help.body}</div>
              </div>
            </div>
            <Button href={help.cta.href} action="book" size="block" arrow className="mt-4">
              {help.cta.label}
            </Button>
          </Card>
        </div>
        {/* Answers render on the server; the accordion only toggles them. */}
        <FaqAccordion panels={faqPanels()} />
      </Container>
      <ClosingCta />
    </section>
  );
}
