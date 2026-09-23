import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { IconTile } from "@/components/ui/IconTile";
import { Kicker } from "@/components/ui/Kicker";
import { Lead } from "@/components/ui/Lead";
import { parentSupport } from "../content";

/** "More than classes": parent-involvement promise with four support points. */
export function ParentSupportSection() {
  return (
    <section className="pt-10 pb-[110px]">
      <Container>
        <div className="grid grid-cols-1 items-start gap-9 rounded-[26px] border border-line bg-white p-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <Kicker>{parentSupport.kicker}</Kicker>
            <Heading size="text-[36px] leading-[1.08] tracking-[-0.035em]" className="mt-3.5">
              {parentSupport.title}
            </Heading>
            <Lead size="text-[17px] leading-[1.65]" className="mt-3.5">
              {parentSupport.lead}
            </Lead>
          </div>
          <ul className="flex flex-col gap-5">
            {parentSupport.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <IconTile icon={item.icon} tone={item.tone} box={46} iconSize={20} />
                <div>
                  <h3 className="m-0 text-[17px] font-extrabold">{item.title}</h3>
                  <div className="mt-0.5 text-body text-muted">{item.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
