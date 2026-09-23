import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { book } from "../content";

/** Illustrative diagnostic report card with animated skill bars. */
export function SampleReport() {
  const { report } = book;
  return (
    <Card radius="rounded-[26px]" className="p-10">
      <Chip tone="greenDeep">{report.chip}</Chip>
      <div className="mt-[18px] flex items-start justify-between gap-4 border-b border-[#EFE8DE] pb-[22px]">
        <div>
          <div className="text-[24px] font-extrabold tracking-[-0.02em]">{report.child}</div>
          <div className="mt-1 text-body text-faint">{report.test}</div>
        </div>
        <div className="rounded-[14px] bg-ink px-[18px] py-3 text-center">
          <div className="text-[15px] font-bold text-haze">{report.stage}</div>
          <div className="mt-0.5 text-fine text-white">{report.stageOf}</div>
        </div>
      </div>
      <dl className="mt-6 flex flex-col gap-5">
        {report.rows.map((r) => (
          <div key={r.id} className={cn(tones[r.tone], "grid grid-cols-[170px_minmax(0,1fr)_48px] items-center gap-3.5")}>
            <dt className="text-[15px] font-medium">{r.label}</dt>
            <dd className="h-2 overflow-hidden rounded-lg bg-[#EEF1F7]" aria-hidden="true">
              <div
                className="h-full origin-left animate-grow rounded-lg bg-(--tone)"
                style={{ width: `${r.value}%`, animationDelay: r.delay }}
              />
            </dd>
            <dd className="text-right text-[15px] font-extrabold">{r.value}%</dd>
          </div>
        ))}
      </dl>
      <div className="mt-7 rounded-2xl bg-[#FBF0D2] px-5 py-[18px] text-[15px] leading-[1.6] text-[#3A2E0A]">
        <strong>{report.focusLabel}</strong>
        {report.focus}
      </div>
      <p className="mt-[18px] text-meta text-[#7A83A3]">{report.note}</p>
    </Card>
  );
}
