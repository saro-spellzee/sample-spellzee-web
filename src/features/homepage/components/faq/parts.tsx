import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import type { FaqCard } from "../../types";

/** Building blocks of the FAQ answer designs (`.fx-*`, `.fq-*` in the export). */
export const fx = {
  stack: "mt-3.5 flex flex-col gap-3",
  box: "rounded-2xl border px-4 py-3.5 shadow-[0_0_0_1px_rgba(150,120,90,.08)]",
  good: "border-l-[3px] border-l-tone-emerald bg-callout-good",
  bad: "border-l-[3px] border-l-tone-pink bg-callout-bad",
  heading: "mb-2.5 flex items-center gap-2 text-[13.5px] font-extrabold",
  two: "grid grid-cols-1 gap-3 sm:grid-cols-2",
  text: "m-0 text-meta leading-[1.55] text-slate",
} as const;

export type BoxProps = {
  className?: string;
  /** Border colour class; the export's boxes have a near-white border unless they set their own. */
  border?: string;
  children: ReactNode;
};

export function Box({ className, border = "border-white/90", children }: BoxProps) {
  return <div className={cn(fx.box, border, className)}>{children}</div>;
}

export type NoteProps = { strong: string; body: string; className?: string };

/** A "Good to know" style note on the green panel. */
export function Note({ strong, body, className }: NoteProps) {
  return (
    <Box className={cn(fx.good, className)}>
      <p className={fx.text}>
        <b>{strong}</b>
        {body}
      </p>
    </Box>
  );
}

export type CheckListProps = {
  items: readonly { label: string; included: boolean }[];
  /** Read before each crossed item, for screen readers, where the list mixes ticks and crosses. */
  excludedLabel?: string;
};

/** Tick (included) or cross (not included) list. */
export function CheckList({ items, excludedLabel }: CheckListProps) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-2 text-meta leading-[1.45] text-slate">
          <Icon
            name={item.included ? "check" : "close"}
            size={14}
            strokeWidth={3}
            className={cn("mt-0.5 flex-none", item.included ? "text-tone-green" : "text-tone-rose")}
          />
          <span>
            {!item.included && excludedLabel ? <span className="sr-only">{`${excludedLabel}: `}</span> : null}
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export type CardsProps = { cards: readonly FaqCard[]; pairs?: boolean };

/** Coloured cards with a top rule (`.fq-cards`): three across, or two with `pairs`. */
export function Cards({ cards, pairs }: CardsProps) {
  return (
    <div className={cn("mt-3.5 grid grid-cols-1 gap-2.5", pairs ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
      {cards.map((card) => (
        <div
          key={card.title}
          className={cn(
            tones[card.tone],
            "rounded-2xl border-t-[3px] border-(--tone) bg-[color-mix(in_srgb,var(--tone)_7%,#fff)] p-3.5 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--tone)_16%,#fff)]",
          )}
        >
          <b className="block text-body font-extrabold text-(--tone)">{card.title}</b>
          <span className="mt-1 block text-meta leading-[1.5] text-ink-soft">{card.body}</span>
        </div>
      ))}
    </div>
  );
}
