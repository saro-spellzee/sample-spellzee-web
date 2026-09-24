import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { Swoosh } from "@/components/ui/Swoosh";
import { book } from "../content";
import { BookSteps } from "../components/book/BookSteps";
import { ReportPreview } from "../components/book/ReportPreview";

/** "How it works": the three steps to a CLM report, and a sample report to explore. */
export function BookSection() {
  const { title } = book;
  return (
    <section id="book" className="py-16 sm:pt-[100px] sm:pb-[110px]">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <Kicker>{book.kicker}</Kicker>
            <Heading className="mt-4">
              {title.before}
              <Swoosh size="xl">{title.mark}</Swoosh>
              {title.after}
            </Heading>
            <Lead size="text-[16.5px] leading-[1.65]" className="mt-3.5 max-w-[560px]">
              {book.lead}
            </Lead>
          </div>
          <Button href={book.cta.href} action="book" arrow>
            {book.cta.label}
          </Button>
        </div>
        <BookSteps />
        <ReportPreview />
      </Container>
    </section>
  );
}
