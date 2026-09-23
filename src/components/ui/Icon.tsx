import { iconPaths, type IconName } from "@/lib/icons";

type IconProps = {
  name: IconName;
  /** Rendered width/height in px (the export sizes icons in px, not rem). */
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** Give the icon an accessible name when it carries meaning on its own. */
  title?: string;
};

/** Stroke icon; colour comes from `currentColor`. Decorative (aria-hidden) unless `title` is set. */
export function Icon({ name, size = 18, strokeWidth = 2, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={iconPaths[name]} />
    </svg>
  );
}
