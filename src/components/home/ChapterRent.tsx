import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LooksCarousel } from "@/components/home/LooksCarousel";

const occasions = [
  { src: "/images/rental/sangeet.png", label: "Sangeet Night" },
  { src: "/images/rental/reception.png", label: "Reception" },
  { src: "/images/rental/Mehendi.png", label: "Mehendi" },
  { src: "/images/rental/cocktail.png", label: "Cocktail" },
];

export function ChapterRent() {
  return (
    <section
      id="chapter-rent"
      className="scroll-mt-20 border-t border-line bg-bg pt-16 sm:pt-20 lg:pt-24"
    >
      <Container className="lg:max-w-none">
        {/* ── Row 1 ── Editorial hero: text (left) + big image (right) ── */}
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* Left — text + CTA */}
          <div className="flex flex-col items-start gap-6 lg:pl-[60px] lg:pr-4 lg:pt-20">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
              Wear it once · Return it clean
            </p>

            <h2
              className="text-[clamp(3.5rem,7vw,6rem)] leading-[0.95] text-brand-dark"
              style={{ fontFamily: "var(--font-great-vibes)" }}
            >
              Rent the
              <br />
              Occasion.
            </h2>

            <p className="max-w-md text-base text-ink-muted">
              3-, 5- or 7-day rentals, delivered dry-cleaned. Deposit refunded
              within 3 working days. Pick your dates, we handle the rest.
            </p>

            <Link
              href="/rent"
              className="mt-2 inline-flex items-center bg-ink px-10 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-brand"
            >
              Browse Rentals
            </Link>
          </div>

          {/* Right — big hero image with overlay */}
          <div className="relative aspect-[5/4] w-full overflow-hidden bg-surface lg:aspect-[4/3]">
            <Image
              src="/images/rental/wedding-guest.png"
              alt="Wedding Guest rental edit"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/75">
                  The Edit
                </span>
                <span className="mt-1 font-serif text-2xl sm:text-3xl">
                  Wedding Guest
                </span>
              </div>
              <Link
                href="/rent?occasion=wedding-guest"
                className="rounded-full border border-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-ink"
              >
                Shop
              </Link>
            </div>
          </div>
        </div>

        {/* ── Row 1b ── Clean 4-up occasion thumbnails ── */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-14 sm:grid-cols-4 sm:gap-5">
          {occasions.map((o) => (
            <Link
              key={o.src}
              href={`/rent?occasion=${o.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-surface"
            >
              <Image
                src={o.src}
                alt={o.label}
                fill
                sizes="(min-width: 1024px) 18vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <p className="absolute inset-x-0 bottom-4 text-center font-sans text-xs font-bold uppercase tracking-[0.22em] text-white sm:bottom-5 sm:text-sm">
                {o.label}
              </p>
            </Link>
          ))}
        </div>
      </Container>

      {/* ── Row 2 ── Shop the Look (SOW B01) — own white backdrop so it reads as its own block ── */}
      <div className="mt-12 bg-white py-14 sm:mt-16 sm:py-16 lg:py-20">
        <LooksCarousel />
      </div>
    </section>
  );
}
