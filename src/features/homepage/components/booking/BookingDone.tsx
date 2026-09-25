import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import type { BookingValues } from "../../booking/schema";
import { booking } from "../../content/booking";
import { describeSlot, difficultyText, formatPhone, languageText, possessive } from "./model";
import { bf } from "./styles";

function Note({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[12px] bg-[#EAF6EF] px-3 py-2.5 text-left text-[13.5px] leading-[1.45] text-[#0B4F37]">
      <span aria-hidden="true" className="grid size-7 flex-none place-items-center rounded-full bg-tone-green text-white">
        <Icon name={icon} size={15} strokeWidth={2.2} />
      </span>
      <span>{children}</span>
    </div>
  );
}

const support =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35";

export type BookingDoneProps = {
  /** The booking as the server accepted it (trimmed, phone digits only). */
  values: BookingValues;
  onDone: () => void;
};

/**
 * Confirmation, shown only once the server has accepted the booking: what happens next,
 * with a way to talk now. `values` are as the schema parsed them (trimmed, phone digits only).
 */
export function BookingDone({ values: state, onDone }: BookingDoneProps) {
  const { done } = booking;
  const parentFirst = state.parent.trim().split(" ")[0] || done.parentFallback;
  const phone = done.phonePrefix + formatPhone(state.phone);
  const whose = possessive(state.kid);
  const cells = [
    { k: done.card.child, v: `${state.kid} · ${state.grade}` },
    { k: done.card.focus, v: difficultyText(state.difficulties) },
    { k: done.card.language, v: languageText(state.language) },
  ];
  return (
    <div className="flex animate-fade-up flex-col items-center gap-3.5 pt-[26px] pb-6">
      <span className="flex size-[74px] animate-success-pop items-center justify-center rounded-full bg-linear-135 from-success-bright to-success-deep shadow-[0_0_0_10px_rgba(18,165,122,.12),0_20px_40px_-16px_rgba(15,138,85,.7)]">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12l5 5L19 7" />
        </svg>
      </span>
      <h2 id="bf-title" tabIndex={-1} className={`${bf.title} text-center`}>
        {done.title.replace("{parent}", parentFirst)}
      </h2>
      {state.mode === "schedule" ? (
        <>
          <p className="m-0 max-w-[440px] text-center text-[15px] leading-[1.6] text-muted">
            {whose}
            {done.schedule.middle}
            <b className="text-ink">{describeSlot(state.date, state.slot)}</b>
            {done.schedule.after}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Note icon="link">
              {done.notes.link.before}
              <b>{done.notes.link.strong}</b>
              {done.notes.link.middle}
              <b>{phone}</b>
              {done.notes.link.after}
            </Note>
            <Note icon="bell">
              {done.notes.reminder.before}
              <b>{done.notes.reminder.strong}</b>
              {done.notes.reminder.after}
            </Note>
          </div>
        </>
      ) : (
        <p className="m-0 max-w-[440px] text-center text-[15px] leading-[1.6] text-muted">
          {done.call.before}
          {whose}
          {done.call.middle}
          <b className="text-ink">{phone}</b>
          {done.call.after}
        </p>
      )}
      <dl className="m-0 grid w-full grid-cols-1 overflow-hidden rounded-2xl border border-line-soft bg-white dlg:grid-cols-2">
        {cells.map((cell, i) => (
          <div key={cell.k} className={i > 0 ? "flex flex-col gap-[3px] border-t border-line-soft px-4 py-3 dlg:border-t-0 dlg:border-l" : "flex flex-col gap-[3px] px-4 py-3"}>
            <dt className="text-[11px] font-extrabold tracking-[.12em] text-subtle uppercase">{cell.k}</dt>
            <dd className="m-0 text-body font-extrabold text-ink">{cell.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 mb-1 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[13.5px] text-ink-soft">
        <span>{done.support.lead}</span>
        <a href={done.support.call.href} className={`${support} bg-brand-tint text-brand hover:bg-tone-blue-soft`}>
          <Icon name="phone" size={15} strokeWidth={2.2} />
          {done.support.call.before}
          <b>{done.support.call.number}</b>
        </a>
        <a href={done.support.whatsapp.href} target="_blank" rel="noopener noreferrer" className={`${support} bg-[#E7F8EE] text-[#128C4A] hover:bg-[#D5F3E2] hover:text-[#128C4A]`}>
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"
            />
          </svg>
          {done.support.whatsapp.label}
        </a>
      </div>
      <ol className="m-0 flex w-full list-none flex-col gap-2 p-0">
        {done.next.map((step, i) => (
          <li key={step.strong} className="flex items-center gap-2.5 text-[13.5px] text-muted">
            <span aria-hidden="true" className="flex size-6 flex-none items-center justify-center rounded-full bg-fog text-[12px] font-extrabold text-ink">
              {i + 1}
            </span>
            <span>
              <b className="text-ink">{step.strong}</b>
              {step.rest}
            </span>
          </li>
        ))}
      </ol>
      <Button size="goCentered" onClick={onDone}>
        {done.button}
      </Button>
    </div>
  );
}
