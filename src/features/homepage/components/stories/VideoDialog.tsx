"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { stories } from "../../content/stories";
import type { Reel } from "../../types";
import { reelGradients } from "./reelGradients";

export type VideoDialogProps = { reel: Reel | null; onClose: () => void };

/**
 * The story video player (a modal). TODO(product): the export has no videos yet and shows a
 * "Video will play here" placeholder; wire each reel's video here when it exists.
 */
export function VideoDialog({ reel, onClose }: VideoDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { video } = stories;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (reel && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first focusable element, which is the full-screen backdrop
      // button: focus would sit on something with no visible ring. Start on the close button.
      closeRef.current?.focus();
    }
    if (!reel && dialog.open) dialog.close();
  }, [reel]);

  return (
    <dialog
      ref={ref}
      aria-label={video.label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-0 size-full max-h-none max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-6 backdrop:bg-transparent open:flex"
    >
      {reel ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label={video.close}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer border-0 bg-[rgba(14,26,58,.7)] backdrop-blur-[6px]"
          />
          <div className="relative w-[min(380px,90vw)] animate-fade-up overflow-hidden rounded-[26px] bg-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,.7)]">
            <div
              className={cn(
                reelGradients[reel.gradient],
                "relative flex aspect-[9/16] max-h-[72svh] w-full flex-col items-center justify-center gap-3 bg-linear-160 from-(--c) to-(--c2) text-white",
              )}
            >
              <span aria-hidden="true" className="reel-texture absolute inset-0" />
              <span aria-hidden="true" className="relative flex size-[72px] items-center justify-center rounded-full bg-white/92 text-(--c)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
              <span className="relative text-meta font-bold opacity-85">{video.note}</span>
            </div>
            <div className="flex items-center justify-between gap-3.5 px-[18px] py-4 text-white">
              <div>
                <div className="text-[16px] font-extrabold">{reel.quote}</div>
                <div className="mt-[3px] text-meta text-mist">
                  {reel.kind} · {reel.tag}
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label={video.close}
                onClick={onClose}
                className="flex size-[38px] flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-white/12 text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <Icon name="close" size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
