import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { booking } from "../content";
import { requestDemo } from "./actions";
import { BOOKING_SOURCE, leadPayload, maskPhone } from "./deliver";
import { HONEYPOT_FIELD, bookingDefaults, type BookingValues } from "./schema";

const WEBHOOK = "https://hooks.example.test/leads";

const valid: BookingValues = {
  ...bookingDefaults,
  kid: "Aarav",
  grade: "Grade 3",
  difficulties: ["read"],
  parent: "Meera Iyer",
  phone: "98765 43210",
  consent: true,
};

describe("requestDemo (Server Action)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 24, 10, 0)); // Thursday 24 September 2026
    fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sent = () => JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body));

  it("posts a valid scheduled booking to the configured webhook, normalised", async () => {
    vi.stubEnv("LEADS_WEBHOOK_URL", WEBHOOK);
    vi.stubEnv("LEADS_WEBHOOK_SECRET", "s3cret");

    const result = await requestDemo({ ...valid, kid: " Aarav ", language: "Tamil", mode: "schedule", date: "2026-09-26", slot: "10:30 AM" });

    expect(result).toEqual({ status: "success" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(WEBHOOK);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer s3cret");
    expect(sent()).toMatchObject({
      type: "demo-booking",
      source: BOOKING_SOURCE,
      child: { name: "Aarav", grade: "Grade 3", difficulties: ["read"] },
      parent: { name: "Meera Iyer", phone: "+919876543210" },
      booking: { mode: "schedule", date: "2026-09-26", time: "10:30 AM" },
      languages: [booking.language.base, "Tamil"],
      consent: { given: true },
    });
    expect(sent().requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("sends only what a counsellor needs: no stray fields, no slot for a call-back", async () => {
    vi.stubEnv("LEADS_WEBHOOK_URL", WEBHOOK);

    await requestDemo({ ...valid, date: "2026-09-26", slot: "10:30 AM", email: "extra@example.com", [HONEYPOT_FIELD]: "" });

    const body = sent();
    expect(body.booking).toEqual({ mode: "call" });
    expect(JSON.stringify(body)).not.toContain("extra@example.com");
    expect(Object.keys(body).sort()).toEqual(["booking", "child", "consent", "languages", "parent", "requestId", "source", "submittedAt", "type"]);
  });

  it("re-validates on the server and returns field errors without delivering", async () => {
    vi.stubEnv("LEADS_WEBHOOK_URL", WEBHOOK);

    await expect(requestDemo({ ...valid, phone: "12345", consent: false })).resolves.toEqual({
      status: "invalid",
      errors: { phone: booking.errors.phone, consent: booking.errors.consent },
    });
    await expect(requestDemo({ ...valid, mode: "schedule", date: "2026-09-27", slot: "4:00 PM" })).resolves.toEqual({
      status: "invalid",
      errors: { slot: booking.errors.slot },
    });
    await expect(requestDemo("not an object")).resolves.toMatchObject({ status: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pretends to succeed for honeypot hits but delivers nothing", async () => {
    vi.stubEnv("LEADS_WEBHOOK_URL", WEBHOOK);

    await expect(requestDemo({ ...valid, [HONEYPOT_FIELD]: "https://spam.test" })).resolves.toEqual({ status: "success" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails loudly in production when no webhook is configured", async () => {
    vi.stubEnv("LEADS_WEBHOOK_URL", "");
    vi.stubEnv("NODE_ENV", "production");

    await expect(requestDemo(valid)).resolves.toEqual({ status: "failed" });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("LEADS_WEBHOOK_URL is not set"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses to send a child's details to a plain-http webhook in production", async () => {
    vi.stubEnv("LEADS_WEBHOOK_URL", "http://hooks.example.test/leads");
    vi.stubEnv("NODE_ENV", "production");

    await expect(requestDemo(valid)).resolves.toEqual({ status: "failed" });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("must be an https:// URL"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs only a masked number and succeeds in development when no webhook is configured", async () => {
    vi.stubEnv("LEADS_WEBHOOK_URL", "");
    vi.stubEnv("NODE_ENV", "development");

    await expect(requestDemo(valid)).resolves.toEqual({ status: "success" });
    const logged = vi.mocked(console.info).mock.calls.flat().join(" ");
    expect(logged).toContain("******3210");
    expect(logged).not.toMatch(/9876543210|Aarav|Meera/);
  });

  it.each([
    ["a non-2xx response", () => fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))],
    ["a network error", () => fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"))],
  ])("reports failure (not success) on %s, with a log line free of personal data", async (_label, arrange) => {
    vi.stubEnv("LEADS_WEBHOOK_URL", WEBHOOK);
    arrange();

    await expect(requestDemo(valid)).resolves.toEqual({ status: "failed" });
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).not.toMatch(/9876543210|43210|Aarav|Meera/);
  });
});

describe("lead payload", () => {
  it("masks all but the last four digits for logs", () => {
    expect(maskPhone("9876543210")).toBe("******3210");
  });

  it("keeps the consent wording the parent saw, with the child's name", () => {
    const payload = leadPayload({ ...valid, phone: "9876543210" }, "req-1", new Date("2026-09-24T04:30:00Z"));
    expect(payload.consent).toEqual({
      given: true,
      at: "2026-09-24T04:30:00.000Z",
      wording: expect.stringContaining("Aarav"),
    });
    expect(payload.consent.wording).toContain(booking.consent.link.label);
  });
});
