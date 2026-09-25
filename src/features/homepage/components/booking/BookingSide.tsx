import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { booking } from "../../content/booking";
import type { SealId } from "../../types";
import { GoogleMark } from "../GoogleMark";

/** Each seal's size inside its 36px disc. */
const sealSize: Record<SealId, string> = { iitm: "size-[30px]", actd: "size-6 object-contain" };

/** Midnight panel beside the booking form (hidden on phones and small tablets). */
export function BookingSide() {
  const { side } = booking;
  return (
    <aside className="relative hidden overflow-hidden bg-midnight text-white dlg:block">
      <span aria-hidden="true" className="pointer-events-none absolute -top-[100px] -left-[120px] h-[280px] w-[320px] rounded-full bg-[rgba(21,87,214,.6)] blur-[60px]" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-[140px] -bottom-20 h-[260px] w-[300px] rounded-full bg-[rgba(124,58,237,.5)] blur-[60px]" />
      <div className="relative z-1 flex h-full flex-col px-7 py-[30px]">
        <span className="flex size-[50px] items-center justify-center rounded-[15px] bg-white shadow-[0_0_0_5px_rgba(255,255,255,.08)]">
          <Image src={side.mark.src} alt="" width={side.mark.width} height={side.mark.height} sizes="24px" className="block h-[26px] w-auto" />
        </span>
        <div className="mt-[22px] text-[11.5px] font-extrabold tracking-[.16em] text-periwinkle uppercase">{side.kicker}</div>
        <div className="mt-2 text-[26px] leading-[1.15] font-extrabold tracking-[-.03em]">{side.title}</div>
        <ul className="mt-[22px] flex flex-col gap-3">
          {side.gets.map((item) => (
            <li key={item.strong} className="flex gap-2.5 text-[14px] leading-[1.45] text-haze">
              <span className="mt-px flex size-[22px] flex-none items-center justify-center rounded-full bg-linear-135 from-success-bright to-success-deep text-white">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
              <span>
                <b className="font-bold text-white">{item.strong}</b>
                {item.rest}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <span className="inline-flex items-center gap-2 text-meta text-haze">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-[5px] pr-[11px] pl-2 text-fine font-bold text-[#3C4043] shadow-[0_6px_14px_-8px_rgba(0,0,0,.6)]">
              <GoogleMark size={15} />
              <span>{side.rating.source}</span>
            </span>
            <b className="text-[15px] text-white">{side.rating.score}</b>
            <span aria-hidden="true" className="tracking-[1px] text-[#F5B942]">
              {side.rating.stars}
            </span>
          </span>
          <span className="flex items-center gap-2">
            {side.seals.map((seal) => (
              <span key={seal.id} className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image src={seal.logo.src} alt={seal.logo.alt} width={seal.logo.width} height={seal.logo.height} sizes="30px" className={`block ${sealSize[seal.id]}`} />
              </span>
            ))}
            <span className="ml-1 text-[12px] font-bold text-haze">{side.sealsText}</span>
          </span>
        </div>
        <div className="mt-4 rounded-[12px] border border-white/12 bg-white/7 px-2 py-2.5 text-center text-[12px] font-bold tracking-[.01em] whitespace-nowrap text-white">
          {side.free}
        </div>
      </div>
    </aside>
  );
}
