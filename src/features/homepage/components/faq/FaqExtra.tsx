import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { faq } from "../../content";
import type { FaqExtra as FaqExtraKind } from "../../types";
import { Box, Cards, Note, fx } from "./parts";
import { AloneExtra, CompareExtra, PaymentExtra, ProgressExtra, StructureExtra } from "./panels";

const { extras } = faq;

function Improve() {
  return (
    <>
      <ol className="mt-3.5 flex list-none flex-wrap gap-2 p-0">
        {extras.improve.steps.map((step, i) => (
          <li
            key={step.label}
            className={cn(
              tones[step.tone],
              "inline-flex items-center gap-[7px] rounded-full bg-white py-[5px] pr-3 pl-[5px] text-meta font-extrabold text-ink shadow-[0_0_0_1px_color-mix(in_srgb,var(--tone)_22%,#fff)]",
            )}
          >
            <b className="grid size-6 place-items-center rounded-full bg-(--tone) text-[12px] text-white">{i + 1}</b>
            {step.label}
          </li>
        ))}
      </ol>
      <Note {...extras.improve.note} className="mt-3" />
    </>
  );
}

function Speak() {
  const { school, spellzee, note } = extras.speak;
  return (
    <>
      <div className={cn(fx.two, "mt-3.5")}>
        <Box className="bg-sand">
          <div className={cn(fx.heading, "text-subtle")}>{school.title}</div>
          <p className={fx.text}>{school.body}</p>
        </Box>
        <Box className="bg-brand-tint">
          <div className={cn(fx.heading, "text-brand")}>{spellzee.title}</div>
          <p className={fx.text}>{spellzee.body}</p>
        </Box>
      </div>
      <Note {...note} className="mt-3" />
    </>
  );
}

function Ages() {
  const { from, to, marks, labels } = extras.ages;
  return (
    <div className={fx.stack}>
      <Box className="bg-sand">
        <div className="flex items-center gap-3">
          <span className="text-meta font-extrabold whitespace-nowrap text-ink">{from}</span>
          <span className="relative h-2 flex-1 rounded-lg bg-[linear-gradient(90deg,#1557D6,#6D3FD6,#D0335F,#E08A12,#12855A)]">
            {marks.map((left) => (
              <i key={left} className="absolute top-1/2 -mt-1.5 -ml-1.5 size-3 rounded-full border-2 border-ink bg-white" style={{ left: `${left}%` }} />
            ))}
          </span>
          <span className="text-meta font-extrabold whitespace-nowrap text-ink">{to}</span>
        </div>
        <div className="mt-2.5 flex justify-between px-0 text-[11.5px] font-bold text-faint sm:px-[42px]">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </Box>
    </div>
  );
}

function Demo() {
  return (
    <div className={fx.stack}>
      <div className="relative grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:before:absolute sm:before:inset-x-[12%] sm:before:top-[15px] sm:before:h-0.5 sm:before:bg-linear-90 sm:before:from-brand sm:before:via-tone-violet sm:before:to-tone-rose sm:before:opacity-35 sm:before:content-['']">
        {extras.demo.map((step, i) => (
          <div key={step.title} className={cn(tones[step.tone], "relative flex flex-col items-center gap-1 px-1 text-center")}>
            <span className="flex size-8 items-center justify-center rounded-full bg-(--tone) text-meta leading-none font-extrabold text-white shadow-[0_0_0_4px_#fff]">{i + 1}</span>
            <b className="mt-1 text-[13.5px] text-ink">{step.title}</b>
            <span className="text-[12px] leading-[1.45] text-muted">{step.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The designed extra under an FAQ answer (cards, comparisons, timelines…), by kind. */
export function FaqExtra({ kind }: { kind: FaqExtraKind }) {
  switch (kind) {
    case "about":
      return <Cards cards={extras.about} />;
    case "online":
      return <Cards cards={extras.online} />;
    case "programmes":
      return (
        <>
          <Cards cards={extras.programmes.cards} pairs />
          <Note {...extras.programmes.note} className="mt-3" />
        </>
      );
    case "improve":
      return <Improve />;
    case "speak":
      return <Speak />;
    case "ages":
      return <Ages />;
    case "demo":
      return <Demo />;
    case "alone":
      return <AloneExtra />;
    case "compare":
      return <CompareExtra />;
    case "structure":
      return <StructureExtra />;
    case "progress":
      return <ProgressExtra />;
    case "payment":
      return <PaymentExtra />;
  }
}
