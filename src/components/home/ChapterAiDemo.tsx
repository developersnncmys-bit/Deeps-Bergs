import { Container } from "@/components/ui/Container";

type DemoCard = {
  id: string;
  video: string;
  title: string;
  caption: string;
};

const demos: DemoCard[] = [
  {
    id: "say",
    video: "/images/Voice-search.mp4",
    title: "Describe it in plain words",
    caption:
      "“Red lehenga for sangeet under ₹20k.” The stylist narrows it down out loud and surfaces the pieces to try.",
  },
  {
    id: "show",
    video: "/images/visual-search.mp4",
    title: "Snap the look you love",
    caption:
      "A photo, a screenshot, a street-style find. We match the piece, pull in close variants and set up the try-on.",
  },
];

export function ChapterAiDemo() {
  return (
    <section
      id="chapter-ai-demo"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <Container>
        {/* Header */}
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center sm:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
            AI assistant
          </p>
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] text-ink"
          >
            Say it. Show it. Shop it.
          </h2>
          <p className="max-w-xl text-sm text-ink-muted sm:text-base">
            Voice search, visual search, 360° try-on and a personal stylist —
            all one tap away. Here&apos;s what it looks like in your hand.
          </p>
        </div>

        {/* Demo videos — side-by-side with 20px gap, shorter frames */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {demos.map(({ id, video, title, caption }) => (
            <article key={id} className="flex flex-col gap-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                <video
                  src={video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-2 px-6 pb-4 text-center sm:px-8">
                <h3
                  style={{ fontFamily: "var(--font-raleway)" }}
                  className="text-xl font-semibold text-ink sm:text-2xl"
                >
                  {title}
                </h3>
                <p className="mx-auto max-w-md text-sm text-ink-muted sm:text-base">
                  {caption}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
