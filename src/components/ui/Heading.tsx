import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type HeadingProps = {
  as?: "h1" | "h2" | "h3";
  /** `display` = the export's `.h1` look, `section` = its `.h2` look. Independent of level. */
  look?: "display" | "section";
  /**
   * Font-size + line-height + tracking classes; replaces the look's defaults
   * (the export overrides these per heading). No class merging, so pass the full set.
   */
  size?: string;
  /** Text colour class. */
  color?: string;
  className?: string;
  id?: string;
  children: ReactNode;
};

const looks = {
  display: "font-extrabold",
  section: "font-extrabold text-balance",
} as const;

const defaultSizes = {
  display: "leading-none tracking-[-0.045em]",
  /** 30px on phones (the export's 640px rule), 36px on tablets, 46px on desktop. */
  section: "text-[30px] leading-[1.2] tracking-[-0.035em] sm:text-[36px] sm:leading-[1.08] lg:text-[46px]",
} as const;

export function Heading({ as: Tag = "h2", look = "section", size, color = "text-ink", className, id, children }: HeadingProps) {
  return (
    <Tag id={id} className={cn("m-0", looks[look], size ?? defaultSizes[look], color, className)}>
      {children}
    </Tag>
  );
}
