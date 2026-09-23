import { tones } from "@/components/ui/tones";
import { clm } from "../content";

/**
 * Curved connectors from each skill pill to the brain, in the design's 1080x440
 * stage coordinates. End points bob 8px (SMIL); the active link shows a flowing dash.
 * Desktop only.
 */
const LINKS = [
  { from: [262, 110], to: [442.6, 179.9] },
  { from: [262, 220], to: [388.7, 242.5] },
  { from: [262, 330], to: [427, 296.4] },
  { from: [818, 110], to: [649.5, 195.6] },
  { from: [818, 220], to: [677.4, 272] },
  { from: [818, 330], to: [630.4, 319] },
] as const;

const BOB = { dur: "7s", keyTimes: "0;0.5;1", keySplines: "0.45 0 0.55 1;0.45 0 0.55 1" } as const;

const curve = (sx: number, sy: number, ex: number, ey: number) => {
  const cx = (sx + ex) / 2;
  return `M${sx} ${sy} C ${cx} ${sy}, ${cx} ${ey}, ${ex} ${ey}`;
};

export function SkillLinks({ active }: { active: number }) {
  return (
    <svg
      viewBox="0 0 1080 440"
      width="100%"
      height="100%"
      aria-hidden="true"
      className="absolute inset-0 hidden overflow-visible lg:block"
    >
      {LINKS.map(({ from: [sx, sy], to: [ex, ey] }, i) => {
        const on = i === active;
        const d = curve(sx, sy, ex, ey);
        const bob = `${d};${curve(sx, sy, ex, ey - 8)};${d}`;
        return (
          <g key={clm.skills[i].id} className={tones[clm.skills[i].tone]}>
            <path d={d} fill="none" strokeWidth={on ? 2.4 : 1.5} opacity={on ? 1 : 0.5} strokeLinecap="round" className="stroke-(--tone)">
              <animate attributeName="d" values={bob} calcMode="spline" repeatCount="indefinite" {...BOB} />
            </path>
            <path d={d} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 54" opacity={on ? 1 : 0} strokeLinecap="round" className="animate-flow">
              <animate attributeName="d" values={bob} calcMode="spline" repeatCount="indefinite" {...BOB} />
            </path>
            <circle cx={sx} cy={sy} r="5.5" stroke="#fff" strokeWidth="2" className="fill-(--tone)" />
            <circle cx={ex} cy={ey} r="3.5" fill="#fff" strokeWidth="1.5" className="stroke-(--tone)">
              <animate attributeName="cy" values={`${ey};${ey - 8};${ey}`} calcMode="spline" repeatCount="indefinite" {...BOB} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
