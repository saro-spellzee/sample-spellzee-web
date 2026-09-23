import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { programs } from "../content";
import type { Program } from "../types";

const lift = "group-hover:bg-(--tone) group-hover:text-white group-focus-visible:bg-(--tone) group-focus-visible:text-white";

export type ProgramCardProps = { program: Program; /** 1-based position, shown as "01", "02"… */ n: number };

/** Programme card: lifts and fills with its tone on hover/focus (`.pcard`). */
export function ProgramCard({ program, n }: ProgramCardProps) {
  const label = programs.ariaLabel.replace("{title}", program.title).replace("{page}", program.page);
  return (
    <Link
      href={program.href}
      aria-label={label}
      className={cn(
        tones[program.tone],
        "group flex h-full w-full cursor-pointer flex-col items-stretch rounded-[22px] border-[1.5px] border-line bg-white p-[22px] text-left text-ink no-underline outline-none",
        "transition-[border-color,box-shadow,translate] duration-300 ease-in-out",
        "hover:-translate-y-1 hover:border-(--tone) hover:text-ink hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--tone)_8%,transparent),0_26px_50px_-30px_var(--tone)]",
        "focus-visible:-translate-y-1 focus-visible:border-(--tone) focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--tone)_8%,transparent),0_26px_50px_-30px_var(--tone)]",
      )}
    >
      <span className="flex items-center justify-between">
        <span className={cn("flex size-12 flex-none items-center justify-center rounded-[14px] bg-(--tone-soft) text-(--tone) transition-colors duration-300", lift)}>
          <Icon name={program.icon} size={22} />
        </span>
        <span className="text-meta font-extrabold tracking-[0.08em] text-[#A7AEC4]">0{n}</span>
      </span>
      <span className="mt-5 block text-[18px] font-extrabold">{program.title}</span>
      <span className="mt-2 block min-h-[4.8em] text-body leading-[1.6] text-muted">{program.description}</span>
      <span className="mt-4 block border-t border-dashed border-line pt-3.5">
        <span className="block text-[10.5px] font-extrabold tracking-[0.14em] text-[#8A93AE] uppercase">{programs.focusLabel}</span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          {program.focusSkills.map((skill) => (
            <span
              key={skill.label}
              className={cn(tones[skill.tone], "inline-flex items-center gap-1.5 rounded-full bg-(--tone)/10 py-1 pr-2.5 pl-2 text-[12px] font-bold text-(--tone)")}
            >
              <span className="size-1.5 rounded-full bg-(--tone)" />
              {skill.label}
            </span>
          ))}
        </span>
      </span>
      <span className="mt-auto block pt-[18px]">
        <span className={cn("flex min-h-12 items-center justify-between gap-2 rounded-[14px] bg-(--tone-soft) py-2 pr-2 pl-3 text-meta font-extrabold tracking-[-.005em] text-(--tone) transition-colors duration-300", lift)}>
          <span className="min-w-0 leading-[1.25]">
            {programs.explorePrefix}
            {program.page}
          </span>
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-(--tone) text-white transition-[translate,background-color] duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] group-hover:translate-x-1 group-hover:bg-white/25 group-focus-visible:translate-x-1 group-focus-visible:bg-white/25">
            <Icon name="arrowRight" size={14} strokeWidth={2.6} />
          </span>
        </span>
      </span>
    </Link>
  );
}
