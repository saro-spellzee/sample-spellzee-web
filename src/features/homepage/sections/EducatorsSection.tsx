import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { educators } from "../content";
import { MentorBrowser } from "../components/MentorBrowser";

/** "Meet Your Child's Mentors": headline stat, programme filters over the mentor cards, and the matching promise. */
export function EducatorsSection() {
  const { stat, match } = educators;
  return (
    <section id="educators" className="relative py-16 sm:pt-[100px] sm:pb-[70px]">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-[620px]">
            <Kicker>{educators.kicker}</Kicker>
            <Heading className="mt-4">
              {educators.title.before}
              <Swoosh size="xl">{educators.title.mark}</Swoosh>
            </Heading>
            <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5">
              {educators.lead}
            </Lead>
          </div>
          <div className="mt-10 flex items-center gap-3.5 rounded-[22px] bg-ink py-3.5 pr-[22px] pl-4 text-white shadow-[0_24px_44px_-26px_rgba(14,26,58,.7)]">
            <div className="bg-linear-90 from-periwinkle to-[#C9B8F7] bg-clip-text text-[40px] leading-none font-extrabold tracking-[-.04em] text-transparent">
              {stat.value}
            </div>
            <div>
              <div className="text-[15px] font-extrabold">{stat.title}</div>
              <div className="mt-0.5 text-fine text-mist">{stat.body}</div>
            </div>
          </div>
        </div>

        <MentorBrowser />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-white bg-white/70 px-5 py-4 shadow-[0_0_0_1px_rgba(150,120,90,.10)]">
          <span className="flex items-center gap-3 text-body font-semibold text-slate">
            <span aria-hidden="true" className="flex size-[34px] flex-none items-center justify-center rounded-full bg-tone-violet-soft text-tone-violet">
              <Icon name="pin" size={15} />
            </span>
            <span>
              {match.before}
              <b className="font-extrabold text-ink">{match.strong}</b>
              {match.after}
            </span>
          </span>
          <Link
            href={educators.cta.href}
            data-action="book"
            className="group inline-flex items-center gap-2 text-body font-extrabold text-brand no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
          >
            {educators.cta.label}
            <Icon name="arrowRight" size={14} strokeWidth={2.4} className="transition-transform duration-250 ease-in-out group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
