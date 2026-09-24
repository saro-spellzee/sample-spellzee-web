import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { IconTile } from "@/components/ui/IconTile";
import { classroom } from "../../content";
import { GoogleMark } from "../GoogleMark";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";
const eqBars = ["h-1.5 [animation-delay:-.2s]", "h-3 [animation-delay:-.5s]", "h-2 [animation-delay:-.8s]", "h-[11px] [animation-delay:-.35s]"];

function Star() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
      <path d={STAR} fill="currentColor" />
    </svg>
  );
}

/** Live-class photo with its overlays, what happens in class, and the Google rating. */
export function LiveClassCard() {
  const { live } = classroom;
  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_24px_50px_-34px_rgba(60,40,140,.45)]">
      <div className="relative min-h-[280px] flex-1">
        <Image src={live.photo.src} alt={live.photo.alt} fill sizes="(min-width: 1001px) 460px, 100vw" className="object-cover" />
        <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-[7px] rounded-full bg-[rgba(14,26,58,.82)] px-3 py-[7px] text-fine font-bold text-white backdrop-blur-[6px]">
          <span aria-hidden="true" className="size-2 rounded-full bg-[#FF4D6D] shadow-[0_0_0_3px_rgba(255,77,109,.35)]" />
          {live.badge}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-2 rounded-full bg-white/85 py-[7px] pr-3 pl-2.5 text-[12px] font-bold text-ink shadow-[0_10px_20px_-12px_rgba(14,26,58,.5)] backdrop-blur-[8px]"
        >
          <span className="inline-flex h-3.5 items-end gap-0.5">
            {eqBars.map((bar) => (
              <i key={bar} className={`block w-[3px] origin-bottom animate-eq rounded-xs bg-brand ${bar}`} />
            ))}
          </span>
          {live.speaking}
        </span>
        <span
          aria-hidden="true"
          className="absolute top-3.5 right-3.5 inline-flex animate-pop-in items-center gap-2 rounded-full bg-white/90 py-[7px] pr-3 pl-[7px] text-[12px] font-bold text-tone-green-deep shadow-[0_12px_24px_-14px_rgba(14,26,58,.5)] backdrop-blur-[8px]"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-linear-135 from-[#22C07A] to-[#0F8A55] text-white">
            <Icon name="check" size={12} strokeWidth={3.4} />
          </span>
          {live.praise}
        </span>
      </div>
      <div className="flex flex-none flex-col px-[22px] pt-[22px] pb-6">
        <h3 className="m-0 text-[18px] font-extrabold">{live.title}</h3>
        <p className="mt-1.5 text-[14px] leading-[1.55] text-muted">{live.body}</p>
        <ul className="mt-[18px] grid grid-cols-2 gap-2.5">
          {live.during.map((item) => (
            <li key={item.id} className="flex items-center gap-2.5 rounded-[14px] border border-[#F0E9DE] bg-[#FBF8F4] p-2.5 text-[13px] leading-[1.25] font-bold text-ink-2">
              <IconTile icon={item.icon} tone={item.tone} box={34} iconSize={16} strokeWidth={item.icon === "check" ? 2.2 : 2} />
              {item.title}
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-[9px] border-t border-dashed border-line pt-4 text-meta font-bold text-muted">
          <span className="sr-only">{live.rating.label}</span>
          <span aria-hidden="true" className="flex size-[30px] flex-none items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_var(--color-line),0_4px_10px_-6px_rgba(14,26,58,.4)]">
            <GoogleMark size={18} />
          </span>
          <b aria-hidden="true" className="text-[17px] font-extrabold tracking-[-.01em] text-ink">
            {live.rating.score}
          </b>
          <span aria-hidden="true" className="inline-flex gap-px text-star">
            {[0, 1, 2, 3].map((i) => (
              <Star key={i} />
            ))}
            <span className="relative inline-flex">
              <span className="inline-flex text-[#E6DFD3]">
                <Star />
              </span>
              <span className="absolute top-0 left-0 inline-flex overflow-hidden text-star" style={{ width: `${live.rating.lastStar}%` }}>
                <Star />
              </span>
            </span>
          </span>
          <span aria-hidden="true">{live.rating.source}</span>
        </p>
      </div>
    </div>
  );
}
