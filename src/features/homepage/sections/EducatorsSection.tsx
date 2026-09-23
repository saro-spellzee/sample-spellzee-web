import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { educators } from "../content";

export function EducatorsSection() {
  const { featured, stat } = educators;
  return (
    <section id="educators" className="pt-[110px] pb-10">
      <Container>
        <div className="max-w-[640px]">
          <Kicker>{educators.kicker}</Kicker>
          <Heading className="mt-3.5">{educators.title}</Heading>
          <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5">
            {educators.lead}
          </Lead>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <Card className="flex flex-wrap items-center gap-[30px] p-[30px]">
            <div className="relative flex h-[186px] w-[150px] flex-none items-center justify-center rounded-[80px_80px_22px_22px] bg-linear-to-b from-[#EFE8FD] to-[#DCCFF8] shadow-[inset_0_0_0_6px_#fff,0_20px_40px_-26px_rgba(85,48,184,.6)]">
              <div className="absolute inset-1.5 overflow-hidden rounded-[74px_74px_16px_16px]">
                <Image src={featured.photo.src} alt={featured.photo.alt} fill sizes="138px" className="object-cover object-top" />
              </div>
              <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11.5px] font-bold whitespace-nowrap text-white">
                <Icon name="check" size={12} strokeWidth={3} className="text-periwinkle" />
                {featured.badge}
              </span>
            </div>
            <div className="min-w-[220px] flex-1">
              <Chip tone="violetDeep">{featured.role}</Chip>
              <h3 className="mt-3.5 text-[26px] font-extrabold tracking-[-0.02em]">{featured.name}</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-body font-medium text-slate">
                {featured.credentials.map((line) => (
                  <li key={line} className="flex items-center gap-2.5">
                    <Icon name="check" size={16} strokeWidth={2.4} className="flex-none text-brand" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="flex flex-col gap-3 rounded-[24px] bg-ink p-[34px] text-white">
            <div className="text-[56px] leading-none font-extrabold tracking-[-0.04em]">{stat.value}</div>
            <div className="text-[17px] font-bold">{stat.title}</div>
            <div className="text-body leading-[1.6] text-mist">{stat.body}</div>
            <ul className="mt-1 flex flex-wrap gap-2">
              {stat.subjects.map((s) => (
                <li key={s} className="rounded-full border border-night-line px-[13px] py-[7px] text-meta">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
