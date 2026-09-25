import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { tones, type Tone } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { educators } from "../content/educators";
import type { Mentor } from "../types";

export type MentorCardProps = { mentor: Mentor; tone: Tone };

/**
 * Mentor card: arched photo, role, certificates and teaching facts (`.ed-card`). The quote over
 * the photo shows on hover, on a tap or click (the card takes focus, outside the Tab order), and
 * while the panel around it has keyboard focus (MentorBrowser), so it's never hover-only.
 */
export function MentorCard({ mentor, tone }: MentorCardProps) {
  const facts = [
    { icon: "gradCap", text: mentor.qualification },
    // The number and the words are two flex items 8px apart, as the export lays out "9 years teaching".
    { icon: "clock", text: <span className="flex gap-2"><span>{mentor.years}</span>{educators.yearsSuffix}</span> },
    { icon: "translate", text: mentor.languages },
  ] as const;
  return (
    <article
      tabIndex={-1}
      className={cn(
        tones[tone],
        "group animate-fade-up snap-start overflow-hidden rounded-[26px] border border-line bg-white shadow-[0_22px_44px_-32px_rgba(14,26,58,.45)] outline-none",
        "transition-[translate,box-shadow,border-color] duration-350 ease-[cubic-bezier(.3,1.2,.5,1)] hover:-translate-y-1.5 hover:border-(--tone) hover:shadow-[0_0_0_3px_var(--tone-soft),0_30px_54px_-30px_rgba(14,26,58,.5)]",
      )}
    >
      <div className="relative mx-2.5 mt-2.5 h-60 overflow-hidden rounded-[120px_120px_18px_18px] bg-(--tone-soft) sm:h-[250px]">
        <Image
          src={mentor.photo.src}
          alt={mentor.photo.alt}
          fill
          sizes="(min-width: 1001px) 260px, (min-width: 641px) 45vw, 80vw"
          className="object-cover object-top transition-transform duration-500 ease-in-out group-hover:scale-[1.04]"
        />
        <span className="absolute inset-x-2.5 bottom-2.5 translate-y-2.5 rounded-[14px] bg-[rgba(14,26,58,.78)] px-3 py-2.5 font-serif text-[17px] leading-[1.25] font-normal text-white italic opacity-0 backdrop-blur-[8px] transition-all duration-350 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100 group-focus-visible/panel:translate-y-0 group-focus-visible/panel:opacity-100">
          “{mentor.quote}”
        </span>
      </div>
      <div className="px-[18px] pt-4 pb-5">
        <span className="inline-block rounded-full bg-(--tone-soft) px-2.5 py-1 text-[11.5px] font-extrabold text-(--tone)">{mentor.role}</span>
        <h3 className="mt-2.5 text-[18px] font-extrabold tracking-[-.01em] text-ink">{mentor.name}</h3>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {educators.certificates.map((cert) => (
            <span key={cert.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#EFE8DE] bg-sand py-[3px] pr-[9px] pl-[3px] text-[11px] font-extrabold text-ink-2">
              <span className="flex size-5 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_var(--color-line)]">
                <Image
                  src={cert.logo.src}
                  alt=""
                  width={cert.logo.width}
                  height={cert.logo.height}
                  sizes="15px"
                  className={cert.id === "actd" ? "block size-[15px] object-contain" : "block h-3 w-auto"}
                />
              </span>
              {cert.label}
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5 text-meta font-semibold text-muted">
          {facts.map((fact) => (
            <span key={fact.icon} className="flex items-center gap-2">
              <Icon name={fact.icon} size={15} className="flex-none text-(--tone)" />
              {fact.text}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
