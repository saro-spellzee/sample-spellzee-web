import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { faqExtras } from "../../content";
import { CompareExtra } from "./panels";

describe("CompareExtra", () => {
  it("says in words which items a column doesn't cover, not only with a cross", () => {
    render(<CompareExtra />);
    const { foundational, phonics, notCovered } = faqExtras.compare;

    for (const item of [...foundational.items, ...phonics.items]) {
      const row = screen.getByText(item.label).closest("li")!;
      if (item.included) expect(row).not.toHaveTextContent(notCovered);
      else expect(row).toHaveTextContent(`${notCovered}: ${item.label}`);
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<CompareExtra />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
