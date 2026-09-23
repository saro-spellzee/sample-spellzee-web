import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { book } from "../content";
import { SampleReport } from "../components/SampleReport";

/** "After you book": the three steps, plus a sample diagnostic report. */
export function BookSection() {
  return (
    <section id="book" className="py-[110px]">
      <Container className="grid grid-cols-1 items-center gap-9 lg:grid-cols-2 lg:gap-14">
        <div>
          <Kicker>{book.kicker}</Kicker>
          <Heading size="text-[40px] leading-[1.08] tracking-[-0.035em]" className="mt-3.5">
            {book.title}
          </Heading>
          <Lead className="mt-3.5">{book.lead}</Lead>
          <ol className="mt-[34px] flex flex-col gap-[26px]">
            {book.steps.map((s) => (
              <li key={s.n} className="flex gap-5">
                <span aria-hidden="true" className="flex size-11 flex-none items-center justify-center rounded-full bg-ink font-extrabold text-white">
                  {s.n}
                </span>
                <div>
                  <h3 className="m-0 text-[18px] font-extrabold">{s.title}</h3>
                  <div className="mt-1 text-[15px] leading-[1.6] text-ink-soft">{s.description}</div>
                </div>
              </li>
            ))}
          </ol>
          <Button href={book.cta.href} arrow className="mt-[34px]">
            {book.cta.label}
          </Button>
        </div>
        <SampleReport />
      </Container>
    </section>
  );
}
