import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Swoosh } from "@/components/ui/Swoosh";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { parentSupport } from "../content";
import { WaveDivider } from "../components/WaveDivider";

const glow = "pointer-events-none absolute rounded-full blur-[90px]";

/** "More Than Classes": the midnight statement band with four support points and the accreditation seals. */
export function ParentSupportSection() {
  const { title, lead } = parentSupport;
  return (
    <section className="relative overflow-hidden bg-midnight py-[92px] text-white sm:py-[clamp(96px,10vw,130px)]">
      <WaveDivider id="wave-band-top" position="top" variant="band" />
      <span aria-hidden="true" className={cn(glow, "-top-40 -left-[140px] size-[520px] bg-brand opacity-55")} />
      <span aria-hidden="true" className={cn(glow, "top-[30%] -right-[120px] size-[460px] bg-tone-purple opacity-45")} />
      <span aria-hidden="true" className={cn(glow, "-bottom-[220px] left-[40%] size-[380px] bg-tone-rose opacity-35")} />
      <Container className="relative z-2">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/18 bg-white/6 px-3.5 py-1.5 text-fine font-bold text-haze">{parentSupport.kicker}</span>
            <h2 className="mt-4 max-w-[620px] text-[clamp(30px,3.4vw,48px)] leading-[1.1] font-extrabold tracking-[-.04em] text-white">
              {title.before}
              <Swoosh size="xl" color="text-white">
                {title.mark}
              </Swoosh>
            </h2>
          </div>
          <p className="m-0 max-w-[440px] text-[15.5px] leading-[1.65] text-mist">
            {lead.before}
            <strong className="font-bold text-white">{lead.strong}</strong>
            {lead.after}
          </p>
        </div>
        <ul className="mt-[34px] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {parentSupport.items.map((item) => (
            <li
              key={item.id}
              className={cn(
                tones[item.tone],
                "group flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3.5 transition-all duration-300 ease-in-out",
                "hover:-translate-y-[3px] hover:border-(--tone) hover:bg-white/9",
              )}
            >
              <span className="flex size-[38px] flex-none items-center justify-center rounded-[12px] bg-white/7 text-(--tone) transition-all duration-300 group-hover:bg-(--tone) group-hover:text-midnight">
                <Icon name={item.icon} size={18} />
              </span>
              <div>
                <h3 className="m-0 text-[15px] font-extrabold text-white">{item.title}</h3>
                <p className="mt-0.5 text-fine text-mist">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-[26px] flex flex-wrap gap-3 lg:absolute lg:top-0 lg:right-7 lg:mt-0">
          {parentSupport.seals.map((seal) => (
            <span
              key={seal.id}
              className="inline-flex items-center gap-2.5 rounded-full border border-white bg-white py-1.5 pr-4 pl-1.5 text-meta text-slate shadow-[0_12px_26px_-14px_rgba(0,0,0,.6)]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-white shadow-[0_0_0_1px_var(--color-line)]">
                <Image
                  src={seal.logo.src}
                  alt={seal.logo.alt}
                  width={seal.logo.width}
                  height={seal.logo.height}
                  sizes="30px"
                  className={seal.id === "actd" ? "block size-6 object-contain" : "block size-[30px]"}
                />
              </span>
              <span>
                <b className="font-extrabold text-ink">{seal.name}</b>
                {seal.caption}
              </span>
            </span>
          ))}
        </div>
      </Container>
      <WaveDivider id="wave-band-bottom" position="bottom" variant="band" />
    </section>
  );
}
