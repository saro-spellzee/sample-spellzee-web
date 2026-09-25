import { WidgetBoundary } from "@/components/errors/WidgetBoundary";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { classroom } from "../content/classroom";
import { widgetError } from "../content/page";
import { LearningTools } from "../components/classroom/LearningTools";
import { LiveClassCard } from "../components/classroom/LiveClassCard";
import { MiniBadge } from "../components/MiniBadge";
import { SpellzeeWord } from "../components/SpellzeeWord";

/** "Inside a Spellzee Classroom": the live-class card beside five try-it learning tools. */
export function ClassroomSection() {
  const { title } = classroom;
  return (
    <section className="py-[88px] sm:pt-[100px] sm:pb-[110px]">
      <Container>
        <div className="max-w-[760px]">
          <Kicker>{classroom.kicker}</Kicker>
          <Heading className="mt-4">
            {title.before}
            <Swoosh size="xl">
              <SpellzeeWord />
              {title.after}
            </Swoosh>
          </Heading>
          <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5 max-w-[620px]">
            {classroom.lead}
          </Lead>
        </div>
      </Container>

      <Container>
        <ul className="mt-7 flex flex-wrap justify-start gap-2.5 sm:justify-end">
          {classroom.badges.map((label) => (
            <li key={label}>
              <MiniBadge>{label}</MiniBadge>
            </li>
          ))}
        </ul>
        <div className="studio-frame mt-3.5 rounded-[30px] p-2.5 lg:rounded-[40px] lg:p-[18px]">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)]">
            <LiveClassCard />
            <WidgetBoundary name="Learning tools" notice={widgetError} className="self-start">
              <LearningTools />
            </WidgetBoundary>
          </div>
        </div>
      </Container>

      <Container>
        <p className="mt-10 text-center text-[16px] font-bold text-slate">{classroom.closing}</p>
      </Container>
    </section>
  );
}
