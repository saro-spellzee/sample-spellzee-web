import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"div"> & {
  /** Radius class; the export varies it per card (20–28px). */
  radius?: string;
};

/** White card with hairline border and soft drop shadow (`.card`). */
export function Card({ radius = "rounded-card", className, ...props }: CardProps) {
  return <div className={cn("border border-line bg-white shadow-card", radius, className)} {...props} />;
}
