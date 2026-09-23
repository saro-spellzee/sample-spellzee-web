import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { stories } from "../content";
import { StoryPicker } from "./StoryPicker";

const storyButton = (i: number) => screen.getByRole("button", { name: new RegExp(stories.items[i].quote) });
/** The featured quote is the paragraph in the navy card (the list items are spans). */
const featured = () => screen.getByText(/./, { selector: "p[aria-live]" });

function expectActive(active: number) {
  stories.items.forEach((_, i) => expect(storyButton(i)).toHaveAttribute("aria-pressed", String(i === active)));
  expect(featured()).toHaveTextContent(stories.items[active].quote);
  expect(featured()).toHaveAttribute("aria-live", "polite");
}

describe("StoryPicker", () => {
  it("features the first story and lists them all", () => {
    render(<StoryPicker />);

    expectActive(0);
    expect(screen.getByRole("button", { name: stories.playLabel })).toBeInTheDocument();
    expect(screen.getByText(stories.storyLabel)).toBeInTheDocument();
  });

  it("features the story that is clicked, with its programme", async () => {
    const user = userEvent.setup();
    render(<StoryPicker />);
    const i = stories.items.length - 1;

    await user.click(storyButton(i));

    expectActive(i);
    expect(screen.getAllByText(stories.items[i].programme).length).toBeGreaterThanOrEqual(2);
  });

  it("can be switched with the keyboard", async () => {
    const user = userEvent.setup();
    render(<StoryPicker />);

    await user.tab(); // play button
    await user.tab(); // first story
    await user.tab(); // second story
    expect(storyButton(1)).toHaveFocus();
    await user.keyboard("{Enter}");

    expectActive(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(<StoryPicker />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
