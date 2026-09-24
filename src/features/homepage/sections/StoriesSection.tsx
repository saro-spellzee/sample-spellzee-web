import { Accent } from "@/components/ui/Accent";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { stories } from "../content";
import { StoryPicker } from "../components/StoryPicker";

export function StoriesSection() {
  return (
    <section id="stories" className="silk bg-bottom py-[110px]">
      <Container>
        <div className="max-w-[640px]">
          <Kicker>{stories.kicker}</Kicker>
          <Heading className="mt-3.5">
            {stories.title.before}
            <Accent className="text-[1.1em] text-vivid-violet">{stories.title.accent}</Accent>
          </Heading>
          <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5">
            {stories.lead}
          </Lead>
        </div>
        <StoryPicker />
      </Container>
    </section>
  );
}
