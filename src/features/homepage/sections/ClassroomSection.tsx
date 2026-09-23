import Image from "next/image";
import { Accent } from "@/components/ui/Accent";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { classroom } from "../content";
import { ClassroomActivities } from "../components/ClassroomActivities";
import { LearningMaterials } from "../components/LearningMaterials";

/** "Inside a Spellzee classroom": live-class card with try-it activities + materials card. */
export function ClassroomSection() {
  const { photo } = classroom;
  return (
    <section className="pt-[100px] pb-[110px]">
      <Container>
        <div className="mx-auto max-w-[720px] text-center">
          <Kicker>{classroom.kicker}</Kicker>
          <Heading className="mt-3.5">
            {classroom.title.before}
            <Accent className="text-[1.1em] text-brand">{classroom.title.accent}</Accent>
          </Heading>
          <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5">
            {classroom.lead}
          </Lead>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card radius="rounded-[28px]" className="p-[22px]">
            <h3 className="m-0 px-1 pt-1 pb-3.5 text-[18px] font-extrabold">{classroom.experienceTitle}</h3>
            <div className="relative aspect-[400/244] overflow-hidden rounded-[20px] bg-[#E9EEF7]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1001px) 620px, 100vw" className="object-cover" />
              <span className="absolute top-3 left-3 inline-flex items-center gap-[7px] rounded-full bg-ink px-3 py-[7px] text-fine font-bold text-white">
                <span aria-hidden="true" className="size-2 rounded-full bg-[#FF4D6D] shadow-[0_0_0_3px_rgba(255,77,109,.3)]" />
                {classroom.liveBadge}
              </span>
            </div>
            <ClassroomActivities />
            <div className="px-1 pt-[18px] pb-1">
              <div className="text-meta font-extrabold text-slate">{classroom.duringTitle}</div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {classroom.during.map((item) => (
                  <Chip key={item.id} tone={item.tone}>
                    {item.label}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>
          <LearningMaterials />
        </div>
        <p className="mt-9 text-center text-[16px] font-bold text-slate">{classroom.closing}</p>
      </Container>
    </section>
  );
}
