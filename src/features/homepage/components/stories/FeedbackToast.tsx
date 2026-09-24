"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { stories } from "../../content/stories";
import { prefersReducedMotion } from "../../hooks/canvas";
import { isMotionPaused } from "../../hooks/motion";
import { datedMessages, relativeWhen, shortDate, type DatedMessage } from "./feedback";

const SHOW_AFTER_MS = 700;
const ROTATE_MS = 7500;
const SWAP_GAP_MS = 380;

const avatars: Record<DatedMessage["avatar"], string> = {
  blue: "bg-tone-blue-soft text-tone-blue",
  plum: "bg-tone-plum-soft text-tone-plum",
  ink: "bg-tone-ink-mist text-ink",
  green: "bg-tone-green-soft text-tone-green",
  olive: "bg-tone-olive-soft text-tone-olive",
  leaf: "bg-tone-leaf-soft text-tone-leaf",
};

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

type Feed = { messages: DatedMessage[]; now: Date };

/**
 * "New message from …'s class": a chat-style card that appears once the stories section is
 * in view, then cycles through recent class feedback every 7.5s. Dismissing it hides it for
 * the visit. It doesn't cycle under reduced motion or while motion is paused, and it isn't a
 * live region, so screen readers aren't interrupted every few seconds.
 */
export function FeedbackToast() {
  const { feedback } = stories;
  const slotRef = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const section = slotRef.current?.closest("section");
    if (!section || typeof IntersectionObserver === "undefined") return;
    let showTimer = 0;
    let swapTimer = 0;
    let rotateTimer = 0;
    const stop = () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(swapTimer);
      window.clearInterval(rotateTimer);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        stop();
        if (!entry.isIntersecting) {
          setShown(false);
          return;
        }
        if (dismissed.current) return;
        showTimer = window.setTimeout(() => {
          const now = new Date();
          setFeed((f) => f ?? { messages: datedMessages(feedback.messages, now), now });
          setShown(true);
          if (prefersReducedMotion()) return;
          rotateTimer = window.setInterval(() => {
            if (dismissed.current) return stop();
            if (isMotionPaused()) return;
            setShown(false);
            swapTimer = window.setTimeout(() => {
              setIndex((i) => i + 1);
              setShown(true);
            }, SWAP_GAP_MS);
          }, ROTATE_MS);
        }, SHOW_AFTER_MS);
      },
      { threshold: 0.3 },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      stop();
    };
  }, [feedback.messages]);

  const message = feed ? feed.messages[index % feed.messages.length] : null;

  return (
    <div ref={slotRef} className="mt-2 flex w-full justify-start lg:mt-0 lg:min-h-[212px] lg:w-[360px] lg:max-w-full lg:justify-end">
      {shown && feed && message ? (
        <div
          key={`${message.id}-${index}`}
          className="relative w-full animate-toast-in rounded-[20px] border border-white bg-white/94 px-4 pt-3.5 pb-3 shadow-[0_0_0_1px_rgba(150,120,90,.12),0_30px_60px_-24px_rgba(14,26,58,.45)] backdrop-blur-[14px]"
        >
          <div className="flex items-center gap-[7px]">
            <span className="flex size-6 items-center justify-center rounded-[7px] bg-white shadow-[0_0_0_1px_var(--color-line),0_3px_8px_-4px_rgba(14,26,58,.35)]">
              <Image src={feedback.mark.src} alt="" width={feedback.mark.width} height={feedback.mark.height} sizes="14px" className="block h-[15px] w-auto" />
            </span>
            <span className="text-[11px] font-extrabold tracking-[.12em] text-faint">{feedback.app}</span>
            <span aria-hidden="true" className="text-[#C3C9D8]">
              ·
            </span>
            <span className="inline-flex items-center gap-[7px] rounded-full bg-success-soft px-[9px] py-[3px] text-[11px] font-extrabold text-tone-green-deep">
              <span aria-hidden="true" className="size-[7px] animate-live-dot rounded-full bg-tone-emerald" />
              {feedback.live}
            </span>
            <span className="ml-auto text-[11.5px] font-bold text-subtle">{relativeWhen(message.end, feed.now)}</span>
            <button
              type="button"
              aria-label={feedback.dismiss}
              onClick={() => {
                dismissed.current = true;
                setShown(false);
              }}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border-0 bg-chip text-faint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
            >
              <Icon name="close" size={11} strokeWidth={2.8} />
            </button>
          </div>
          <div className="mt-2.5 text-body font-extrabold text-ink">{feedback.title.replace("{kid}", message.kid)}</div>
          <div className="mt-2.5 flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className={cn(
                "flex size-[42px] flex-none items-center justify-center rounded-full text-[15px] font-extrabold shadow-[0_0_0_3px_#fff,0_0_0_4px_#DCE4F5]",
                avatars[message.avatar],
              )}
            >
              {message.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-meta font-extrabold text-ink">
                {message.kid} <span className="text-[12px] font-semibold text-faint">· {message.slot}</span>
              </div>
              <div className="mt-1.5 origin-top-left animate-bubble-in rounded-[4px_16px_16px_16px] bg-[#F1EDE6] px-[13px] py-2.5 text-[14px] leading-[1.45] font-semibold text-ink-2">
                {message.text}
              </div>
              <div className="mt-[7px] flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-subtle">
                <span role="img" aria-label={feedback.stars} className="inline-flex gap-px">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={STAR} className="fill-star" />
                    </svg>
                  ))}
                </span>
                <span>{feedback.byline.replace("{tutor}", message.tutor).replace("{date}", shortDate(message.end))}</span>
                <span role="img" aria-label={feedback.delivered} className="ml-auto inline-flex">
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="stroke-tone-teal">
                    <path d="M1 6l3 3 6-7M6 9l1 1 7-8" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
