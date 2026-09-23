import { Fragment } from "react";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { clmSteps } from "../content";

const sizes = {
  lg: { chip: "py-[9px] pr-4 pl-[9px] text-[14px]", num: "size-[22px] text-[12px]" },
  sm: { chip: "py-1.5 pr-3 pl-1.5 text-fine", num: "size-5 text-[11px]" },
} as const;

type ClmStepChipsProps = { size: keyof typeof sizes; arrows?: boolean; className?: string };

/** Assess → Map → Personalise → Progress chips (CLM section and first FAQ answer). */
export function ClmStepChips({ size, arrows, className }: ClmStepChipsProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex flex-wrap items-center", className)}>
      {clmSteps.map((step, i) => (
        <Fragment key={step.n}>
          <Chip tone={step.tone} size={s.chip}>
            <span className={cn("inline-flex items-center justify-center rounded-full bg-(--tone) text-white", s.num)}>
              {step.n}
            </span>
            {step.label}
          </Chip>
          {arrows && i < clmSteps.length - 1 ? (
            <span aria-hidden="true" className="text-[#A89CD8]">
              →
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
