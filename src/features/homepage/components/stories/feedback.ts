/**
 * Timing for the "Live class feedback" toast, as in the export: each message is dated to
 * the most recent end of its class (before now), newest first, and labelled relative to now.
 */
import { stories } from "../../content";
import type { FeedbackMessage } from "../../types";

export type DatedMessage = FeedbackMessage & { end: Date };

/** The latest time the message's class ended, looking back up to a week. */
export function lastClassEnd(message: FeedbackMessage, now: Date): Date {
  for (let back = 0; back < 8; back++) {
    const d = new Date(now);
    d.setDate(d.getDate() - back);
    d.setHours(message.endHour, message.endMinute, 0, 0);
    if (message.days.includes(d.getDay()) && d <= now) return d;
  }
  return now;
}

export function datedMessages(messages: readonly FeedbackMessage[], now: Date): DatedMessage[] {
  return messages.map((m) => ({ ...m, end: lastClassEnd(m, now) })).sort((a, b) => b.end.getTime() - a.end.getTime());
}

/** "Just now", "12 min ago", "3 hr ago", "Yesterday" or a weekday name. */
export function relativeWhen(end: Date, now: Date): string {
  const { when } = stories.feedback;
  const mins = Math.round((now.getTime() - end.getTime()) / 60000);
  if (end.toDateString() === now.toDateString()) {
    if (mins < 2) return when.now;
    if (mins < 60) return when.minutes.replace("{n}", String(mins));
    return when.hours.replace("{n}", String(Math.round(mins / 60)));
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (end.toDateString() === yesterday.toDateString()) return when.yesterday;
  return end.toLocaleDateString("en-IN", { weekday: "long" });
}

/** "Mon, 21 Sept" */
export function shortDate(end: Date): string {
  return end.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
