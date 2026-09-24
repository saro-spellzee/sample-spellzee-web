import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { stories } from "../content/stories";
import { FeedbackToast } from "../components/stories/FeedbackToast";
import { ReelRow } from "../components/stories/ReelRow";
import { WaveDivider } from "../components/WaveDivider";

/** "Stories of Progress": heading with the live feedback card, then the story reels. */
export function StoriesSection() {
  return (
    <section id="stories" className="silk relative overflow-hidden bg-bottom py-[88px] sm:pt-[140px] sm:pb-[150px]">
      <WaveDivider id="wave-stories-top" position="top" />
      <Container className="relative z-2">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-[640px]">
            <Kicker>{stories.kicker}</Kicker>
            <Heading className="mt-4">
              {stories.title.before}
              <Swoosh size="xl">{stories.title.mark}</Swoosh>
            </Heading>
            <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5">
              {stories.lead}
            </Lead>
          </div>
          <FeedbackToast />
        </div>
        <ReelRow
          cta={
            <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <span className="text-[16px] font-extrabold text-ink">{stories.ctaText}</span>
              <Button href={stories.cta.href} action="book" size="compact" arrow>
                {stories.cta.label}
              </Button>
            </div>
          }
        />
      </Container>
      <WaveDivider id="wave-stories-bottom" position="bottom" />
    </section>
  );
}
