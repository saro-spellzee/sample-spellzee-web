import { Card } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { classroom } from "../content";

const flashcardStyles = [
  "left-5 top-4 text-tone-rose [transform:rotate(-9deg)] group-hover:[transform:rotate(-14deg)_translateX(-14px)]",
  "left-[74px] top-2 z-1 text-brand",
  "left-32 top-4 text-tone-amber [transform:rotate(9deg)] group-hover:[transform:rotate(14deg)_translateX(14px)]",
];

/** Learning materials list, fanning flashcards (fan out on hover) and the level scale. */
export function LearningMaterials() {
  return (
    <Card radius="rounded-[28px]" className="flex flex-col bg-linear-to-b from-white to-[#F7F9FE] p-[30px]">
      <h3 className="m-0 text-[21px] font-extrabold">{classroom.materialsTitle}</h3>
      <p className="mt-1.5 text-[14px] leading-[1.55] text-muted">{classroom.materialsLead}</p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {classroom.materials.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white px-3.5 py-3 transition-[translate,box-shadow] duration-300 ease-in-out hover:-translate-y-1 hover:shadow-card-hover"
          >
            <IconTile icon={m.icon} tone={m.tone} box={38} />
            <span className="text-body font-bold">{m.title}</span>
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="group relative mx-auto mt-[26px] h-[140px] w-[240px]">
        {classroom.flashcards.map((card, i) => (
          <span
            key={card}
            className={`absolute flex h-[104px] w-[92px] items-center justify-center rounded-[14px] border border-line bg-white text-[32px] font-extrabold shadow-[0_14px_28px_-16px_rgba(14,26,58,.45)] transition-transform duration-300 ease-in-out ${flashcardStyles[i]}`}
          >
            {card}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2.5 pt-[18px] text-[12px] font-semibold text-muted">
        <span>{classroom.scale.from}</span>
        <span aria-hidden="true" className="h-[5px] flex-1 rounded-[5px] bg-[linear-gradient(90deg,#1557D6,#D0335F,#E08A12,#12855A)]" />
        <span>{classroom.scale.to}</span>
      </div>
    </Card>
  );
}
