"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { IconTile } from "@/components/ui/IconTile";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { clm } from "../content";
import { useBrainCanvas } from "../hooks/useBrainCanvas";
import { prefersReducedMotion } from "../hooks/canvas";
import { isMotionPaused } from "../hooks/motion";
import { SkillLinks } from "./SkillLinks";

const AUTO_ADVANCE_MS = 3600;
const IDLE_AFTER_TOUCH_MS = 7000;

/**
 * The six CLM skills around the brain. Hover, focus or click a pill to select it;
 * while the section is in view and untouched for 7s, it auto-advances every 3.6s.
 * Auto-advance pauses while the pointer or keyboard focus is inside the map, and is
 * off entirely under prefers-reduced-motion or the page's "Pause motion" switch (WCAG 2.2.2).
 */
export function SkillMap() {
  const skills = clm.skills;
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const lastTouch = useRef(Number.NEGATIVE_INFINITY);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBrainCanvas(canvasRef, activeRef);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const root = rootRef.current;
      const sec = root?.closest("section");
      if (!root || !sec || prefersReducedMotion() || isMotionPaused()) return;
      if (root.matches(":hover") || root.contains(document.activeElement)) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      if (r.bottom < vh * 0.25 || r.top > vh * 0.75) return;
      if (performance.now() - lastTouch.current < IDLE_AFTER_TOUCH_MS) return;
      setActive((i) => (i + 1) % skills.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [skills.length]);

  const pick = (i: number, e: SyntheticEvent) => {
    lastTouch.current = e.timeStamp; // same clock as performance.now()
    setActive(i);
  };
  const skill = skills[active];

  return (
    <div ref={rootRef}>
      <div className="relative mx-auto mt-4 grid w-full max-w-[1000px] grid-cols-1 gap-3 sm:grid-cols-2 lg:block lg:aspect-[1080/440]">
        <SkillLinks active={active} />
        <div className="relative col-span-full mx-auto w-3/5 animate-brain [mask-image:radial-gradient(ellipse_50%_50%_at_50%_52%,#000_68%,transparent_100%)] lg:absolute lg:top-[10.45%] lg:left-[31.48%] lg:w-[37.04%]">
          <Image src={clm.brain.src} alt={clm.brain.alt} width={clm.brain.width} height={clm.brain.height} sizes="(min-width: 1001px) 370px, 60vw" className="block w-full" />
          <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
        </div>
        {skills.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={(e) => pick(i, e)}
              onMouseEnter={(e) => pick(i, e)}
              onFocus={(e) => pick(i, e)}
              style={{ "--y": `${s.y}%` } as CSSProperties}
              className={cn(
                tones[s.tone],
                "relative flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[18px] border-[1.5px] py-2.5 pr-5 pl-2.5 text-body font-bold text-ink backdrop-blur-[8px] transition-all duration-300 ease-in-out",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
                "lg:absolute lg:top-(--y) lg:-translate-y-1/2",
                s.side === "left" ? "lg:left-[23.15%] lg:-translate-x-full" : "lg:left-[76.85%]",
                on
                  ? "border-(--tone) bg-white shadow-[0_0_0_4px_color-mix(in_srgb,var(--tone)_13%,transparent),0_16px_34px_-18px_var(--tone)]"
                  : "border-white bg-white/75 shadow-[0_12px_30px_-18px_rgba(60,40,140,.45)] hover:bg-white",
              )}
            >
              <span className="flex size-[34px] items-center justify-center rounded-[11px] bg-(--tone-soft) text-(--tone)">
                <Icon name={s.icon} size={18} />
              </span>
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          tones[skill.tone],
          "relative z-3 mx-auto mt-6 max-w-[480px] rounded-[20px] border-[1.5px] border-(--tone)/40 bg-white px-[26px] pt-5 pb-[22px] text-center lg:-mt-[52px]",
          "shadow-[0_0_0_5px_color-mix(in_srgb,var(--tone)_8%,transparent),0_22px_50px_-22px_color-mix(in_srgb,var(--tone)_67%,transparent)]",
          "transition-[border-color,box-shadow] duration-450 ease-in-out",
        )}
      >
        <div className="inline-flex items-center gap-2.5">
          <IconTile icon={skill.icon} tone={skill.tone} box={34} iconSize={17} />
          <h3 className="m-0 text-[17px] font-extrabold text-(--tone)">{skill.name}</h3>
        </div>
        {skill.alt ? (
          <div className="mt-2">
            <Chip tone={skill.tone} size="px-[11px] py-1 text-[12px]">
              <span>
                {clm.altPrefix}
                {skill.alt}
              </span>
            </Chip>
          </div>
        ) : null}
        <p className="mt-2 text-body leading-[1.6] text-ink-soft">{skill.description}</p>
      </div>
    </div>
  );
}
