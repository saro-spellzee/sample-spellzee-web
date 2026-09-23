import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { footer } from "../content";
import { subscribeToNewsletter } from "./actions";
import { NEWSLETTER_SOURCE, maskEmail } from "./deliver";
import { HONEYPOT_FIELD, initialNewsletterState } from "./schema";

const WEBHOOK = "https://hooks.example.test/newsletter";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}
const submit = (fields: Record<string, string>) => subscribeToNewsletter(initialNewsletterState, form(fields));

describe("subscribeToNewsletter (Server Action)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("posts a valid, trimmed email to the configured webhook", async () => {
    vi.stubEnv("NEWSLETTER_WEBHOOK_URL", WEBHOOK);
    vi.stubEnv("NEWSLETTER_WEBHOOK_SECRET", "s3cret");

    await expect(submit({ email: " parent@example.com " })).resolves.toEqual({ status: "success" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(WEBHOOK);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer s3cret");
    expect(JSON.parse(String(init.body))).toMatchObject({ email: "parent@example.com", source: NEWSLETTER_SOURCE });
  });

  it("re-validates on the server and returns field errors without delivering", async () => {
    vi.stubEnv("NEWSLETTER_WEBHOOK_URL", WEBHOOK);

    await expect(submit({ email: "not-an-email" })).resolves.toEqual({
      status: "invalid",
      errors: { email: footer.newsletter.errors.invalid },
    });
    await expect(submit({})).resolves.toEqual({ status: "invalid", errors: { email: footer.newsletter.errors.required } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pretends to succeed for honeypot hits but delivers nothing", async () => {
    vi.stubEnv("NEWSLETTER_WEBHOOK_URL", WEBHOOK);

    await expect(submit({ email: "bot@example.com", [HONEYPOT_FIELD]: "https://spam.test" })).resolves.toEqual({ status: "success" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails loudly in production when no webhook is configured", async () => {
    vi.stubEnv("NEWSLETTER_WEBHOOK_URL", "");
    vi.stubEnv("NODE_ENV", "production");

    await expect(submit({ email: "parent@example.com" })).resolves.toEqual({ status: "failed" });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("NEWSLETTER_WEBHOOK_URL is not set"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs a masked address and succeeds in development when no webhook is configured", async () => {
    vi.stubEnv("NEWSLETTER_WEBHOOK_URL", "");
    vi.stubEnv("NODE_ENV", "development");

    await expect(submit({ email: "parent@example.com" })).resolves.toEqual({ status: "success" });
    const logged = vi.mocked(console.info).mock.calls.flat().join(" ");
    expect(logged).toContain("pa****@example.com");
    expect(logged).not.toContain("parent@example.com");
  });

  it.each([
    ["a non-2xx response", () => fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))],
    ["a network error", () => fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"))],
  ])("reports failure (not success) on %s, with a generic log line", async (_label, arrange) => {
    vi.stubEnv("NEWSLETTER_WEBHOOK_URL", WEBHOOK);
    arrange();

    await expect(submit({ email: "parent@example.com" })).resolves.toEqual({ status: "failed" });
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).not.toContain("parent@example.com");
  });
});

describe("maskEmail", () => {
  it("keeps the domain and at most two leading characters", () => {
    expect(maskEmail("parent@example.com")).toBe("pa****@example.com");
    expect(maskEmail("a@example.com")).toBe("a****@example.com");
    expect(maskEmail("nope")).toBe("***");
  });
});
