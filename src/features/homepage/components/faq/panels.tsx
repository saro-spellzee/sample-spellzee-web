import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { faqExtras as extras } from "../../content/faq";
import { Box, CheckList, fx } from "./parts";

/** "Can my child take just the Phonics course?": what phonics alone does and doesn't cover. */
export function AloneExtra() {
  const { good, missing, recommendation: rec } = extras.alone;
  return (
    <div className={fx.stack}>
      <div className={fx.two}>
        <Box className={fx.good}>
          <div className={cn(fx.heading, "text-tone-green-deep")}>{good.title}</div>
          <CheckList items={good.items.map((label) => ({ label, included: true }))} />
        </Box>
        <Box className={fx.bad}>
          <div className={cn(fx.heading, "text-tone-rose-deep")}>{missing.title}</div>
          <CheckList items={missing.items.map((label) => ({ label, included: false }))} />
        </Box>
      </div>
      <Box className="bg-brand-tint">
        <div className={cn(fx.heading, "text-brand")}>{rec.title}</div>
        <p className="mb-2 text-[13.5px] leading-[1.6] text-slate">
          {rec.first.before}
          <b className="text-ink">{rec.first.strong}</b>
          {rec.first.middle}
          <b className="text-ink">{rec.first.strong2}</b>
          {rec.first.after}
        </p>
        <p className="mb-2 text-[13.5px] leading-[1.6] text-slate">{rec.second}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3.5">
          <Button href={rec.cta.href} action="book" size="smTight">
            {rec.cta.label}
          </Button>
          <Link href={rec.secondary.href} className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-tone-violet no-underline">
            {rec.secondary.label}
            <Icon name="arrowRight" size={14} strokeWidth={2.4} />
          </Link>
        </div>
      </Box>
    </div>
  );
}

/** "How do Foundational Skills compare to Phonics?": side-by-side coverage. */
export function CompareExtra() {
  const { foundational, phonics, recommendation } = extras.compare;
  const columns = [
    { data: foundational, border: "border-[#F7DDBE]", box: "bg-[#FFF4E8]", title: "text-[#B45309]", tag: "bg-[#FBE3C4] text-[#9A4A06]", result: "bg-[#FBE3C4] text-[#7A3D05]" },
    { data: phonics, border: "border-[#D6E2FB]", box: "bg-brand-tint", title: "text-brand", tag: "bg-[#DCE7FC] text-[#1245A8]", result: "bg-[#DCE7FC] text-[#0E2F7A]" },
  ];
  return (
    <div className={fx.stack}>
      <div className={fx.two}>
        {columns.map(({ data, border, box, title, tag, result }) => (
          <Box key={data.title} border={border} className={cn("flex flex-col", box)}>
            <div className={cn(fx.heading, title)}>
              {data.title} <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-extrabold", tag)}>{data.tag}</span>
            </div>
            <div className="mb-3">
              <CheckList items={data.items} excludedLabel={extras.compare.notCovered} />
            </div>
            <div className={cn("mt-auto rounded-[10px] px-3 py-[9px] text-fine font-semibold", result)}>
              <b>{data.result.strong}</b>
              {data.result.body}
            </div>
          </Box>
        ))}
      </div>
      <Box className="border-l-[3px] border-l-tone-emerald bg-callout-good">
        <p className="m-0 text-[13.5px] leading-[1.6] text-slate">
          <b className="text-tone-green-deep">{recommendation.strong}</b>
          {recommendation.body}
        </p>
      </Box>
    </div>
  );
}

/** "How are classes structured…?": class format and course lengths. */
export function StructureExtra() {
  const s = extras.structure;
  return (
    <div className={fx.stack}>
      <Box className="bg-brand-tint">
        <div className={cn(fx.heading, "text-brand")}>{s.title}</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {s.stats.map((stat) => (
            <div key={stat.value} className={cn(tones[stat.tone], "flex flex-col items-center gap-1 rounded-[12px] bg-white px-2 py-3 text-center")}>
              <Icon name={stat.icon} size={18} className="text-(--tone)" />
              <b className="text-[14px] text-ink">{stat.value}</b>
              <span className="text-[11.5px] text-faint">{stat.label}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box className="bg-sand">
        <div className={cn(fx.heading, "text-slate")}>{s.lengthTitle}</div>
        <div className="grid grid-cols-3 gap-2">
          {s.plans.map((plan) => (
            <div key={plan.value} className={cn(tones[plan.tone], "flex flex-col items-center rounded-[12px] border-t-[3px] border-(--tone) bg-white px-2 py-3")}>
              <b className="text-[26px] leading-[1.1] font-extrabold tracking-[-.02em] text-(--tone)">{plan.value}</b>
              <span className="text-[12px] font-bold text-faint">{s.unit}</span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-fine leading-[1.55] text-muted">{s.note}</p>
      </Box>
    </div>
  );
}

/** "How will I know my child is progressing?": the three touchpoints. */
export function ProgressExtra() {
  return (
    <div className={fx.stack}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {extras.progress.map((tile) => (
          <div key={tile.title} className={cn(tones[tile.tone], "flex flex-col gap-1 rounded-[14px] bg-(--tone-soft) p-3")}>
            <span className="mb-1 flex size-8 items-center justify-center rounded-[10px] bg-white text-(--tone)">
              <Icon name={tile.icon} size={18} />
            </span>
            <b className="text-[13.5px] text-ink">{tile.title}</b>
            <span className="text-[12px] leading-[1.45] text-slate">{tile.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "How does payment work…?": per-class payment and the refund policy. */
export function PaymentExtra() {
  const { classes, refund } = extras.payment;
  return (
    <div className={fx.stack}>
      <div className={fx.two}>
        <Box className={fx.good}>
          <div className={cn(fx.heading, "text-tone-green-deep")}>
            <Icon name="calendar" size={18} className="text-tone-green" />
            {classes.title}
          </div>
          <p className={fx.text}>{classes.body}</p>
        </Box>
        <Box className={fx.bad}>
          <div className={cn(fx.heading, "text-tone-rose-deep")}>
            <Icon name="history" size={18} className="text-tone-rose" />
            {refund.title}
          </div>
          <p className={fx.text}>
            {refund.body} {refund.timing}
          </p>
        </Box>
      </div>
    </div>
  );
}
