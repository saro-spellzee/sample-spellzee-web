import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const base =
  "group inline-flex cursor-pointer items-center gap-3 rounded-full font-bold leading-none no-underline " +
  "transition-[translate,scale,box-shadow,background-color,color,border-color] duration-250 ease-in-out " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand/35";

const primary =
  "btn-shine relative isolate overflow-hidden text-white hover:text-white " +
  "bg-[linear-gradient(135deg,#2A6BF0_0%,#1557D6_48%,#5A3FDA_100%)] " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] ";

const variants = {
  primary:
    primary +
    "shadow-[inset_0_1px_0_rgba(255,255,255,.35),inset_0_-2px_0_rgba(10,20,60,.14),0_14px_30px_-12px_rgba(21,87,214,.7),0_4px_12px_-6px_rgba(90,63,218,.5)] " +
    "hover:shadow-[inset_0_1px_0_rgba(255,255,255,.4),inset_0_-2px_0_rgba(10,20,60,.14),0_20px_40px_-14px_rgba(21,87,214,.85),0_6px_16px_-6px_rgba(90,63,218,.6)]",
  /** Primary with a soft halo that stays put on hover (the closing CTA bar on midnight). */
  halo:
    primary +
    "shadow-[0_0_0_5px_rgba(127,166,255,.14),inset_0_1px_0_rgba(255,255,255,.35),0_16px_34px_-12px_rgba(21,87,214,.9)]",
  ghost:
    "border border-control-line bg-white text-ink hover:-translate-y-0.5 hover:border-brand hover:text-brand " +
    "hover:shadow-[0_12px_26px_-16px_rgba(21,87,214,.6)]",
} as const;

const sizes = {
  /** default `.btn` */
  md: { box: "min-h-[52px] pl-[26px] pr-2 text-[15.5px]", arrow: "size-9", icon: 16 },
  /** `.btn-ghost` keeps even padding */
  mdEven: { box: "min-h-[52px] px-[22px] text-[15.5px]", arrow: "size-9", icon: 16 },
  /** `.btn-sm` */
  sm: { box: "min-h-11 px-5 text-sm", arrow: "size-8", icon: 14 },
  /** `.btn-sm` with 18px sides (buttons inside FAQ answers) */
  smTight: { box: "min-h-11 px-[18px] text-sm", arrow: "size-8", icon: 14 },
  /** `.btn-sm` with an arrow (programs help card, stories footer) */
  compact: { box: "min-h-11 pl-5 pr-1.5 text-sm", arrow: "size-8", icon: 14 },
  /** full-width, arrow pushed right (FAQ help card) */
  block: { box: "min-h-12 w-full justify-between pl-5 pr-1.5 text-[14.5px]", arrow: "size-[34px]", icon: 15 },
  /** `.btn-sm` matched to a 48px input */
  field: { box: "min-h-12 px-5 text-sm", arrow: "size-8", icon: 14 },
  /** `.bf-go`: the booking form's full-width step button */
  go: { box: "min-h-[54px] w-full justify-between pl-6 pr-2 text-[15.5px]", arrow: "size-9", icon: 16 },
  /** `.bf-go` with its label centred and no arrow (the booking confirmation's Done) */
  goCentered: { box: "min-h-[54px] w-full justify-center px-6 text-[15.5px]", arrow: "size-9", icon: 16 },
} as const;

export type ButtonProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Adds the round arrow badge on the right. */
  arrow?: boolean;
  /**
   * Rendered as `data-action`. Page-level widgets listen for it: `"book"` opens the booking
   * dialog instead of following the link (the link stays the no-JS fallback).
   */
  action?: string;
  className?: string;
} & (
  | { href: string; type?: never; disabled?: never; onClick?: never }
  | { href?: undefined; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void }
);

/** Pill button (`.btn` + `.btn-primary`/`.btn-ghost`/`.btn-sm`). Renders a link when given `href`. */
export function Button({ children, variant = "primary", size = "md", arrow, action, className, ...rest }: ButtonProps) {
  const s = sizes[size];
  const classes = cn(base, variants[variant], s.box, className);
  const content = (
    <>
      {children}
      {arrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex flex-none items-center justify-center rounded-full bg-white text-brand",
            "shadow-[0_4px_10px_-4px_rgba(10,20,60,.45)]",
            "transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] group-hover:translate-x-1",
            s.arrow,
          )}
        >
          <Icon name="arrowRight" size={s.icon} strokeWidth={2.4} />
        </span>
      ) : null}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} data-action={action} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type={rest.type ?? "button"}
      disabled={rest.disabled}
      onClick={rest.onClick}
      data-action={action}
      className={cn(classes, "disabled:cursor-wait disabled:opacity-70")}
    >
      {content}
    </button>
  );
}
