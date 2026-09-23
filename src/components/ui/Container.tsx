import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/** The export's `.wrap`: 1200px max width with 40px gutters (20px on phones). */
export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mx-auto max-w-[1200px] px-5 sm:px-10", className)} {...props} />;
}
