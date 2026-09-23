import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { tones, type Tone } from "./tones";

const boxes = {
  28: "size-7 rounded-[9px]",
  30: "size-[30px] rounded-[9px]",
  34: "size-[34px] rounded-[10px]",
  38: "size-[38px] rounded-[11px]",
  40: "size-10 rounded-[12px]",
  46: "size-[46px] rounded-[14px]",
  48: "size-12 rounded-[14px]",
  50: "size-[50px] rounded-full",
  52: "size-[52px] rounded-[15px]",
} as const;

type IconTileProps = {
  icon: IconName;
  tone: Tone;
  /** Box size in px; each carries the export's matching corner radius. */
  box?: keyof typeof boxes;
  iconSize?: number;
  strokeWidth?: number;
  className?: string;
};

/** Tinted square (or circle) holding a stroke icon (`.tile`). */
export function IconTile({ icon, tone, box = 48, iconSize = 18, strokeWidth = 2, className }: IconTileProps) {
  return (
    <span
      className={cn(
        "flex flex-none items-center justify-center bg-(--tone-soft) text-(--tone)",
        tones[tone],
        boxes[box],
        className,
      )}
    >
      <Icon name={icon} size={iconSize} strokeWidth={strokeWidth} />
    </span>
  );
}
