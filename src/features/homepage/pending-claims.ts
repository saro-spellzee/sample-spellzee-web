/**
 * Claims the page shows that product hasn't confirmed yet. The page keeps them as designed, but
 * the machine-readable outputs (the JSON-LD graph and /llms.txt) leave them out: search and answer
 * engines repeat what those say as fact, and cite it.
 *
 * TODO(product): confirm each claim. Once one is confirmed and verifiable, delete its id here and
 * it's published everywhere.
 *
 * Never built from unconfirmed claims at all (so not listed here): an AggregateRating or Review
 * from the "Rated 4.8 out of 5 on Google" badge, and Person nodes for the named mentors.
 */
const pending = {
  /** `hero.ledger` ids: "98% Parent Satisfaction", "Get Refund in 30 Mins". */
  ledger: new Set(["satisfaction", "refund"]),
  /** `community.stats` ids: "3 Million+ Minutes of Live Classes". */
  stat: new Set(["minutes"]),
  /** FAQ answer parts: `faqExtras.payment.refund.timing` ("…released within 30 minutes"). */
  faq: new Set(["refund-timing"]),
};

/** Whether a claim may go into structured data and llms.txt. */
export const isPublishable = (kind: keyof typeof pending, id: string) => !pending[kind].has(id);
