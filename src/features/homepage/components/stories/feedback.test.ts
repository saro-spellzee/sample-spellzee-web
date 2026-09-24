import { describe, expect, it } from "vitest";
import { stories } from "../../content";
import type { FeedbackMessage } from "../../types";
import { datedMessages, lastClassEnd, relativeWhen } from "./feedback";

const { when } = stories.feedback;
const weekdays: FeedbackMessage = { ...stories.feedback.messages[0], days: [1, 2, 3, 4, 5], endHour: 20, endMinute: 0 };

describe("lastClassEnd", () => {
  it("is today's class when it has already ended", () => {
    const now = new Date(2026, 8, 24, 21, 0); // Thursday, 9 PM
    expect(lastClassEnd(weekdays, now)).toEqual(new Date(2026, 8, 24, 20, 0));
  });

  it("goes back to the last class day when today's hasn't ended or there is none", () => {
    expect(lastClassEnd(weekdays, new Date(2026, 8, 24, 19, 0))).toEqual(new Date(2026, 8, 23, 20, 0));
    expect(lastClassEnd(weekdays, new Date(2026, 8, 27, 12, 0))).toEqual(new Date(2026, 8, 25, 20, 0)); // Sunday → Friday
  });
});

describe("datedMessages", () => {
  it("orders messages newest first", () => {
    const list = datedMessages(stories.feedback.messages, new Date(2026, 8, 24, 21, 30));
    for (let i = 1; i < list.length; i++) expect(list[i - 1].end.getTime()).toBeGreaterThanOrEqual(list[i].end.getTime());
    expect(list).toHaveLength(stories.feedback.messages.length);
  });
});

describe("relativeWhen", () => {
  const end = new Date(2026, 8, 24, 20, 0);
  it("labels the time since the class ended", () => {
    expect(relativeWhen(end, new Date(2026, 8, 24, 20, 1))).toBe(when.now);
    expect(relativeWhen(end, new Date(2026, 8, 24, 20, 12))).toBe(when.minutes.replace("{n}", "12"));
    expect(relativeWhen(end, new Date(2026, 8, 24, 23, 10))).toBe(when.hours.replace("{n}", "3"));
    expect(relativeWhen(end, new Date(2026, 8, 25, 9, 0))).toBe(when.yesterday);
    expect(relativeWhen(end, new Date(2026, 8, 27, 9, 0))).toBe("Thursday");
  });
});
