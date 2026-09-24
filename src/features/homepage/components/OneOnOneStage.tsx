import Image from "next/image";
import { IconTile } from "@/components/ui/IconTile";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { oneOnOne } from "../content/oneOnOne";
import type { ImageAsset } from "../types";

function Avatar({ image, label, className }: { image: ImageAsset; label: string; className: string }) {
  return (
    <div
      className={cn(
        "absolute top-1/2 flex size-[66px] animate-floaty items-center justify-center overflow-visible rounded-full border-4 border-white shadow-[0_20px_40px_-18px_rgba(14,26,58,.55)] [transform:translate(-50%,-50%)] sm:size-[88px]",
        className,
      )}
    >
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 641px) 80px, 58px" className="block size-full rounded-full object-cover" />
      <span className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 text-meta font-bold whitespace-nowrap text-ink-2">{label}</span>
    </div>
  );
}

/** Mentor ↔ child illustration with the big "1:1", then the four feature cards. */
export function OneOnOneStage() {
  return (
    <div className="relative">
      <div className="relative h-[210px] sm:h-[250px]">
        <svg viewBox="0 0 520 300" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
          <path
            d="M118 150 C 190 30, 330 30, 402 150"
            fill="none"
            stroke="#AFC0EC"
            strokeWidth="1.6"
            strokeDasharray="4 7"
            vectorEffect="non-scaling-stroke"
            className="animate-flow-slow"
          />
        </svg>
        <span aria-hidden="true" className="absolute top-[13%] left-1/2 -mt-1.5 -ml-1.5 size-3 rounded-full bg-brand shadow-[0_0_0_8px_rgba(21,87,214,.12)]" />
        <Avatar image={oneOnOne.mentor.image} label={oneOnOne.mentor.label} className="left-[22.7%] bg-ink" />
        <Avatar image={oneOnOne.student.image} label={oneOnOne.student.label} className="left-[77.3%] bg-vivid-rose [animation-delay:-3s]" />
        <div
          aria-hidden="true"
          className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[84px] leading-none tracking-[-.02em] whitespace-nowrap text-ink italic sm:text-[128px]"
        >
          {oneOnOne.ratio[0]}
          <span className="relative mr-[.04em] ml-[.02em] inline-block h-[.56em] w-[.24em]">
            <i className="absolute top-0 left-1/2 -ml-[.055em] size-[.11em] rounded-full bg-ink" />
            <i className="absolute bottom-[.02em] left-1/2 -ml-[.055em] size-[.11em] rounded-full bg-ink" />
          </span>
          {oneOnOne.ratio[1]}
        </div>
      </div>
      <ul className="mt-3.5 grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
        {oneOnOne.features.map((f) => (
          <li
            key={f.id}
            className={cn(
              tones[f.tone],
              "flex h-full items-center gap-3 rounded-[18px] border border-l-[3px] border-white border-l-(--tone) bg-white/90 px-4 py-3.5 shadow-feat",
              "transition-[translate,box-shadow] duration-300 ease-in-out hover:-translate-y-[3px] hover:shadow-[0_24px_44px_-26px_rgba(70,45,20,.5)]",
            )}
          >
            <IconTile icon={f.icon} tone={f.tone} box={40} />
            <h3 className="m-0 text-[15px] leading-[1.25] font-extrabold text-ink">{f.title}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
}
