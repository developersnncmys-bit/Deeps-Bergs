import Link from "next/link";
import { Container } from "@/components/ui/Container";

const paths = [
  {
    num: "01",
    title: "Start shopping",
    body: "Browse the full catalogue across wedding, contemporary and active.",
    cta: "Open the shop",
    href: "/s/wedding",
  },
  {
    num: "02",
    title: "Rent a look",
    body: "Pick a garment and a window. Delivered, cleaned, collected.",
    cta: "See rentals",
    href: "/search?mode=rent",
  },
  {
    num: "03",
    title: "Try it on first",
    body: "Upload a photo and see yourself in anything in the catalogue.",
    cta: "Open try-on",
    href: "/account/try-ons",
  },
];

export function ChapterCTA() {
  return (
    <section
      id="chapter-ready"
      className="scroll-mt-20 border-t border-line bg-ink py-24 text-white sm:py-32 lg:py-40"
    >
      <Container className="flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-sans text-6xl text-accent">05</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
            Ready?
          </span>
        </div>

        <h2 className="max-w-[18ch] text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02] text-white">
          Three doors in.
          <br />
          <span className="text-accent">Pick one.</span>
        </h2>

        <p className="max-w-xl text-lg text-white/70">
          No wrong answer — every path lands you in the same wardrobe,
          curated the same way.
        </p>

        <div className="mt-6 grid w-full gap-4 sm:grid-cols-3">
          {paths.map((p) => (
            <Link
              key={p.num}
              href={p.href}
              className="group flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-white/15 bg-white/5 p-8 text-left transition-colors hover:border-white/60 hover:bg-white/10"
            >
              <span className="font-sans text-4xl text-accent">{p.num}</span>
              <h3 className="text-2xl text-white">{p.title}</h3>
              <p className="text-sm text-white/70">{p.body}</p>
              <span className="mt-auto text-sm font-medium text-white group-hover:text-accent">
                {p.cta} &rarr;
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
