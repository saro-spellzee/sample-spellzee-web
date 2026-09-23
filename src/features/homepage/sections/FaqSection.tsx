import { Accent } from "@/components/ui/Accent";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Lead } from "@/components/ui/Lead";
import { faq } from "../content";
import { FaqAccordion } from "../components/FaqAccordion";

export function FaqSection() {
  const { help } = faq;
  return (
    <section id="faq" className="silk bg-bottom py-[110px]">
      <Container className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-[110px]">
          <Heading look="display" size="text-[56px] leading-[1.02] tracking-[-0.045em]">
            {faq.title.line1}
            <br />
            <Accent className="text-[1.1em] text-tone-rose">{faq.title.accent}</Accent>
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
            <Button href={help.cta.href} size="block" arrow className="mt-4">
              {help.cta.label}
            </Button>
          </Card>
        </div>
        <FaqAccordion />
      </Container>
    </section>
  );
}
