import Image from "next/image";
import { Fragment } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { hero } from "../content";

/** Frosted "Accreditations & Recognition" bar under the hero CTAs (`.cred-*`). */
export function CredentialBar() {
  return (
    <div className="glass-gradient inline-block rounded-[22px] px-[18px] pt-3 pb-3.5">
      <div className="flex items-center gap-[7px] text-[10.5px] font-extrabold tracking-[.16em] text-muted uppercase">
        <Icon name="shield" size={13} strokeWidth={2.2} className="text-brand" />
        {hero.credentialsLabel}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-[18px]">
        {hero.credentials.map((cred, i) => (
          <Fragment key={cred.id}>
            {i > 0 ? (
              <span aria-hidden="true" className="h-[38px] w-px bg-linear-to-b from-transparent via-[#E4DACC] to-transparent" />
            ) : null}
            <div className="flex items-center gap-3 transition-transform duration-300 ease-in-out hover:-translate-y-0.5">
              <span className="flex size-[54px] flex-none items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_#EDE6DB,0_0_0_5px_rgba(139,92,246,.07),0_10px_20px_-12px_rgba(14,26,58,.4)]">
                <Image
                  src={cred.logo.src}
                  alt={cred.logo.alt}
                  width={cred.logo.width}
                  height={cred.logo.height}
                  sizes="46px"
                  className={cn("block", cred.logoClass)}
                />
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-[16px] font-extrabold tracking-[-.01em] text-ink">
                  {cred.name}
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[15px] items-center justify-center rounded-full bg-linear-135 from-[#22C07A] to-[#0F8A55] text-white shadow-[0_0_0_2px_var(--color-success-soft)]"
                  >
                    <Icon name="check" size={9} strokeWidth={4} />
                  </span>
                </div>
                <div className="mt-px text-fine font-semibold text-muted">{cred.caption}</div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
