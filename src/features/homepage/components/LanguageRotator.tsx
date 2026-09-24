import { cn } from "@/lib/cn";
import { hero } from "../content";

const delays = ["", "[animation-delay:2s]", "[animation-delay:4s]", "[animation-delay:6s]"];

/**
 * "English / தமிழ் / മലയാളം / हिन्दी" fading through in place (CSS only). Hidden from screen
 * readers, which get the plain sentence instead; shows English alone under reduced motion.
 */
export function LanguageRotator() {
  const { names, spoken } = hero.language;
  return (
    <>
      <span aria-hidden="true" className="ml-0.5 inline-grid align-middle leading-[1.5] font-extrabold text-tone-amber">
        {names.map((name, i) => (
          <span
            key={name.lang}
            lang={name.lang}
            className={cn("col-start-1 row-start-1 animate-lang-rot text-center opacity-0", delays[i], i === 0 && "motion-reduce:opacity-100")}
          >
            {name.text}
          </span>
        ))}
      </span>
      <span className="sr-only">{spoken}</span>
    </>
  );
}
