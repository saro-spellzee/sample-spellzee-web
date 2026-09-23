"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { classroom } from "../content";
import { BlendGame } from "./BlendGame";
import { ReadAndAnswer } from "./ReadAndAnswer";
import { segment } from "./segment";

/**
 * Tabbed "try it" activities. Both panels stay mounted (hidden when inactive)
 * so each keeps its progress when switching tabs, as in the export.
 */
export function ClassroomActivities() {
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = classroom.tabs.length;

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -tab, End: count - 1 - tab };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (tab + keys[e.key] + count) % count;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="mt-4 min-h-[236px] rounded-[20px] border border-[#E1E8F5] bg-[#F2F6FD] p-[22px]">
      <div role="tablist" aria-label={classroom.activitiesLabel} className="flex gap-2" onKeyDown={onKeyDown}>
        {classroom.tabs.map((label, i) => (
          <button
            key={label}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`activity-tab-${i}`}
            aria-selected={tab === i}
            aria-controls={`activity-panel-${i}`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
            className={cn(segment.base, tab === i ? segment.on : segment.off)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="activity-panel-0" aria-labelledby="activity-tab-0" hidden={tab !== 0}>
        <BlendGame />
      </div>
      <div role="tabpanel" id="activity-panel-1" aria-labelledby="activity-tab-1" hidden={tab !== 1}>
        <ReadAndAnswer />
      </div>
    </div>
  );
}
