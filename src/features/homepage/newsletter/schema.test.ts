import { describe, expect, it } from "vitest";
import { footer } from "../content";
import { EMAIL_MAX_LENGTH, newsletterSchema } from "./schema";

const { errors } = footer.newsletter;
const firstError = (input: unknown) => {
  const r = newsletterSchema.safeParse(input);
  return r.success ? undefined : r.error.issues[0]?.message;
};

describe("newsletterSchema", () => {
  it("accepts a valid email and trims surrounding spaces", () => {
    expect(newsletterSchema.parse({ email: "  parent@example.com " })).toEqual({ email: "parent@example.com" });
  });

  it.each([[{}], [{ email: null }], [{ email: "" }], [{ email: "   " }]])("requires an email (%j)", (input) => {
    expect(firstError(input)).toBe(errors.required);
  });

  it.each(["not-an-email", "a@b", "@example.com", "parent@", "a b@example.com"])("rejects %s", (email) => {
    expect(firstError({ email })).toBe(errors.invalid);
  });

  it("rejects addresses over the RFC length limit", () => {
    const email = `${"a".repeat(EMAIL_MAX_LENGTH)}@example.com`;
    expect(firstError({ email })).toBe(errors.tooLong);
  });
});
