const letters = [
  { ch: "S", color: "text-[#ED2224]" },
  { ch: "p", color: "text-[#F37A20]" },
  { ch: "e", color: "text-[#D4A200] [text-shadow:0_1px_0_rgba(120,85,0,.35)]" },
  { ch: "l", color: "text-[#36B34A]" },
  { ch: "l", color: "text-[#1592B6]" },
  { ch: "z", color: "text-[#6A3C98]" },
  { ch: "e", color: "text-[#E91E7E]" },
  { ch: "e", color: "text-[#EF4545]" },
];

/**
 * "Spellzee" in the brand's letter colours (`.sz-word`). The letters are inline spans with
 * no gaps, so the text (and what screen readers read) is the plain word.
 */
export function SpellzeeWord() {
  return (
    <span className="tracking-[-.02em]">
      {letters.map((l, i) => (
        <span key={i} className={l.color}>
          {l.ch}
        </span>
      ))}
    </span>
  );
}
