import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { programs } from "../content";
import { ProgramCard } from "../components/ProgramCard";

export function ProgramsSection() {
  const { title, help } = programs;
  return (
    <section id="programs" className="py-16 sm:pt-[100px] sm:pb-[110px]">
      <Container>
        <div className="max-w-[900px]">
          <Kicker>{programs.kicker}</Kicker>
          <Heading className="mt-4">
            {title.before}
            <Swoosh size="xl">{title.mark}</Swoosh>
            {title.after}
          </Heading>
          <Lead size="text-[16.5px] leading-[1.65]" className="mt-3">
            {programs.lead}
          </Lead>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.items.map((program, i) => (
            <li key={program.id}>
              <ProgramCard program={program} n={i + 1} />
            </li>
          ))}
        </ul>

        <Card radius="rounded-[22px]" className="mt-[18px] flex flex-col flex-wrap items-start justify-between gap-[18px] py-[18px] pr-5 pl-[18px] sm:flex-row sm:items-center">
          {/* stacks on phones, with the CTA below (the export's 640px rule) */}
          <div className="flex min-w-0 flex-1 basis-[240px] items-center gap-4">
            <span className="flex size-[52px] flex-none items-center justify-center rounded-[15px] bg-brand-tint text-brand">
              <Icon name="question" size={24} />
            </span>
            <div className="min-w-0">
              <div className="text-[17px] font-extrabold">{help.title}</div>
              <div className="mt-[3px] text-body text-ink-soft">{help.body}</div>
            </div>
          </div>
          <Button href={help.cta.href} action="book" size="compact" arrow>
            {help.cta.label}
          </Button>
        </Card>
      </Container>
    </section>
  );
}
