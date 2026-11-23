import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { AiToolkitStrip } from "@/components/home/AiToolkitStrip";

export function ChapterTryOn() {
  return (
    <section
      id="chapter-tryon"
      className="scroll-mt-20 border-t border-line bg-white"
    >
      {/* ── Main try-on panel ── */}
      <Container className="grid gap-16 py-20 sm:py-28 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:py-36">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="font-sans text-6xl text-brand">03</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
              Try it on
            </span>
          </div>

          <h2 className="text-[clamp(2.25rem,5vw,4rem)] leading-[1.05]">
            Your face,
            <br />
            any garment,
            <br />
            <span className="text-brand">in seconds.</span>
          </h2>

          <p className="max-w-md text-lg text-ink-muted">
            Upload a photo once. Virtual try-on shows you wearing anything in
            the catalogue — before you commit to a size, a colour, or a price.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <LinkButton href="/account/try-ons" size="md">
              Try it with your photo
            </LinkButton>
            <LinkButton href="/stylist" size="md" variant="ghost">
              Talk to the stylist &rarr;
            </LinkButton>
          </div>
        </div>

        <div className="relative aspect-[4/3] max-h-[480px] w-full overflow-hidden rounded-[var(--radius-lg)] bg-surface ring-2 ring-brand ring-offset-4 ring-offset-white">
          <video
            src="/images/try-on.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <span className="absolute right-3 top-3 rotate-3 rounded-full bg-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
            AI
          </span>
        </div>
      </Container>

      {/* ── Toolkit strip (Kalki-style gradient + typewriter headline) ── */}
      <AiToolkitStrip />
    </section>
  );
}
