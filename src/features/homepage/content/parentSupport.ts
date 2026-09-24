/** "We don't disappear after enrollment": parent support. */
import type { IconItem } from "../types";
import { seals } from "./shared";

export const parentSupport = {
  kicker: "More Than Classes",
  title: { before: "We Don’t Disappear After ", mark: "Enrollment." },
  lead: {
    before: "We stay involved, keep parents informed, monitor progress and support every stage of your child’s journey, with our ",
    strong: "Parents and Students First Approach",
    after: ".",
  },
  items: [
    { id: "guidance", title: "Teacher Guidance", description: "Your child’s mentor gives personalised support in every class.", icon: "users", tone: "blueLight" },
    { id: "monitoring", title: "Academic Monitoring", description: "We track your child’s learning progress week by week.", icon: "bars", tone: "roseLight" },
    { id: "updates", title: "Parent Updates", description: "You stay informed through regular updates and reports.", icon: "bell", tone: "amberLight" },
    { id: "continuous", title: "Continuous Progress", description: "We support your child at every stage of the journey.", icon: "loop", tone: "mintLight" },
  ] satisfies IconItem[],
  seals,
};
