"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { book } from "../../content/book";
import type { ReportLegend } from "../../types";
import { ReportSide } from "./ReportSide";

const CIRCUMFERENCE = 276.46; // 2π × 44, the ring's radius in its 100×100 viewBox
const kicker = "text-[11px] font-extrabold tracking-[.16em] text-faint uppercase";

/** Legend dots: the strength and priority rings' tones, and a lighter blue for "developing". */
const legendDots: Record<ReportLegend["id"], string> = {
  strength: "bg-tone-pink",
  developing: "bg-[#6D8BFF]",
  priority: "bg-tone-emerald",
};

/**
 * The sample "CLM Passport": tap a skill ring to read what the mentor observed, and a week
 * of the plan to see its focus. Three columns on wide screens, two below 1100px, one on phones.
 */
export function ReportPreview() {
  const { report } = book;
  const { observation, plan } = report;
  const [ring, setRing] = useState(report.initialRing);
  const [week, setWeek] = useState(0);
  const now = report.rings[ring];

  return (
    <div className="relative mt-[18px] grid grid-cols-1 overflow-hidden rounded-[30px] border border-white bg-white/88 shadow-[0_0_0_1px_rgba(150,120,90,.12),0_40px_80px_-50px_rgba(60,40,140,.5)] backdrop-blur-[14px] md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,380px)]">
      <ReportSide />

      <div className="px-[26px] pt-[26px] pb-5">
        <div className={kicker}>{report.kicker}</div>
        <h3 className="mt-2 font-serif text-[32px] leading-[1.1] font-medium text-ink">{report.title}</h3>
        <p className="mt-1.5 text-[13.5px] text-muted">{report.sub}</p>
        <div className="mt-[18px] grid grid-cols-2 gap-3">
          {report.rings.map((r, i) => {
            const on = i === ring;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                onClick={() => setRing(i)}
                className={cn(
                  tones[r.tone],
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-[18px] border-[1.5px] px-2.5 py-3.5 transition-all duration-300 ease-in-out",
                  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
                  on ? "border-(--tone) bg-(--tone-soft) shadow-[0_14px_28px_-20px_var(--tone)]" : "border-transparent bg-transparent hover:bg-paper",
                )}
              >
                <span className="relative size-[104px]">
                  <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full -rotate-90">
                    <circle cx="50" cy="50" r="44" fill="none" strokeWidth="9" className="stroke-[#EEEAE3]" />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      className="animate-ring-in stroke-(--tone)"
                      style={{ strokeDashoffset: (CIRCUMFERENCE * (1 - r.value / 100)).toFixed(1) }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[22px] font-extrabold text-ink">{r.value}%</span>
                </span>
                <span className="text-body font-extrabold text-ink">{r.label}</span>
                <span className={cn("rounded-full px-2.5 py-[3px] text-[11.5px] font-extrabold", on ? "bg-(--tone) text-white" : "bg-(--tone-soft) text-(--tone)")}>
                  {r.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="col-span-full flex flex-col gap-3.5 border-t border-[#F1E8D8] bg-[#FBF6EC] p-[22px] xl:col-span-1 xl:border-t-0 xl:border-l">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={kicker}>{observation.kicker}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-rose-soft px-2.5 py-1 text-[10.5px] font-extrabold tracking-[.04em] text-tone-rose-deep uppercase">
              <span aria-hidden="true" className="size-[7px] rounded-full bg-tone-pink" />
              {observation.live}
            </span>
          </div>
          <div className="mt-2.5 font-serif text-[24px] leading-[1.15] font-medium text-ink">{observation.title}</div>
          <div
            key={now.id}
            aria-live="polite"
            className={cn(
              tones[now.tone],
              "mt-2.5 flex animate-fade-up gap-2.5 rounded-[14px] border border-[#F1E8D8] bg-white p-3 text-[13.5px] leading-[1.55] text-slate",
            )}
          >
            <span aria-hidden="true" className="flex size-[30px] flex-none items-center justify-center rounded-full bg-(--tone-soft) text-(--tone)">
              <Icon name="chat" size={16} />
            </span>
            <span>
              <b className="text-(--tone)">{now.label}:</b> {now.note}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#F5E1B8] bg-[#FDF0D5] p-3.5">
          <div className="text-[11px] font-extrabold tracking-[.14em] text-tone-amber-deep uppercase">{plan.title}</div>
          <div className="mt-1 text-fine text-[#5D4A1F]">{plan.body}</div>
          <div className="relative mt-3 grid grid-cols-4 gap-1.5 before:absolute before:inset-x-[12%] before:top-[15px] before:h-0.5 before:bg-[#EBCB85] before:content-['']">
            {plan.weeks.map((w, i) => {
              const on = i === week;
              const done = i < week;
              return (
                <button
                  key={w.focus}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setWeek(i)}
                  className="relative flex cursor-pointer flex-col items-center gap-[3px] border-0 bg-transparent p-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
                >
                  <span
                    className={cn(
                      "flex size-[30px] items-center justify-center rounded-full border-2 text-meta font-extrabold transition-all duration-250 ease-in-out",
                      on
                        ? "border-tone-amber bg-tone-amber text-white shadow-[0_0_0_4px_rgba(194,98,10,.18)]"
                        : done
                          ? "border-[#F5D892] bg-[#F5D892] text-tone-amber-deep"
                          : "border-[#EBCB85] bg-white text-tone-amber-deep",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[11.5px] font-extrabold text-[#3A2E0A]">{plan.weekLabel.replace("{n}", String(i + 1))}</span>
                  <span className="text-[11px] text-[#7A5E22]">{w.focus}</span>
                </button>
              );
            })}
          </div>
          <div aria-live="polite" className="mt-2.5 min-h-14 rounded-[12px] bg-white px-3 py-2.5 text-fine leading-[1.5] text-[#3A2E0A]">
            {plan.weeks[week].detail}
          </div>
        </div>
      </div>

      <div className="col-span-full flex flex-wrap items-center justify-between gap-3.5 border-t border-hairline px-[22px] py-3 text-[12px] text-faint">
        <span>{report.note}</span>
        <span className="inline-flex items-center gap-1.5 font-bold">
          {report.legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <i aria-hidden="true" className={cn("ml-2.5 size-[9px] rounded-full", legendDots[item.id])} />
              {item.label}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
