import { Container } from "@/components/ui/Container";

const steps = [
  {
    num: "01",
    title: "Make your choice",
    body: "Browse Wedding, Contemporary and Active. Filter by size, colour and occasion.",
    Icon: IconBrowse,
  },
  {
    num: "02",
    title: "See it on you",
    body: "Upload a photo once. Virtual Try-On shows the fit before you commit.",
    Icon: IconTryOn,
  },
  {
    num: "03",
    title: "Buy or rent",
    body: "Own it forever, or wear it once. Pick your dates on rentals.",
    Icon: IconBuyRent,
  },
  {
    num: "04",
    title: "Delivered & tailored",
    body: "Free alterations included. Shipped to your door in days.",
    Icon: IconDeliver,
  },
  {
    num: "05",
    title: "Keep it or send it back",
    body: "On rentals, our courier picks up at the end of your window — deposit refunded.",
    Icon: IconReturn,
  },
];

export function ChapterHow() {
  return (
    <section
      id="chapter-how"
      className="scroll-mt-20 bg-[#141414] py-14 text-white sm:py-16 lg:py-20"
    >
      <Container>
        {/* Header */}
        <div className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white">
            How it works
          </p>
          <h2 className="font-serif text-2xl text-white sm:text-3xl">
            Five steps, three doors in.
          </h2>
          <p className="max-w-xl text-sm text-white/65">
            Same journey whether you&apos;re here to buy, rent, or just try the
            look on first.
          </p>
        </div>

        {/* All 5 steps in a single row on desktop, 2-col on tablet, stacked on mobile */}
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5 lg:gap-6">
          {steps.map((s, i) => (
            <Step key={s.num} {...s} connect={i < steps.length - 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function Step({
  num,
  title,
  body,
  Icon,
  connect,
}: {
  num: string;
  title: string;
  body: string;
  Icon: React.FC;
  connect: boolean;
}) {
  return (
    <div className="relative flex flex-col items-start gap-3 text-left">
      {/* Number row with optional connector line into the next step */}
      <div className="flex w-full items-center gap-3">
        <span className="font-serif text-xs uppercase tracking-[0.3em] text-white">
          {num}
        </span>
        {connect && (
          <span
            aria-hidden
            className="hidden h-px flex-1 bg-white/15 lg:block"
          />
        )}
      </div>

      {/* Icon */}
      <div className="text-white">
        <Icon />
      </div>

      {/* Title */}
      <h3 className="font-sans text-sm font-bold uppercase tracking-[0.1em] text-white">
        {title}
      </h3>

      {/* Body */}
      <p className="text-[13px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}

function IconBrowse() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="7" y="9" width="14" height="18" rx="1.5" />
      <rect x="25" y="9" width="14" height="10" rx="1.5" />
      <rect x="25" y="23" width="14" height="14" rx="1.5" />
      <rect x="7" y="31" width="14" height="6" rx="1.5" />
    </svg>
  );
}

function IconTryOn() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="8" y="12" width="32" height="26" rx="2" />
      <circle cx="24" cy="25" r="6" />
      <path d="M17 12l3-4h8l3 4" strokeLinejoin="round" />
    </svg>
  );
}

function IconBuyRent() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M11 16h26l-2 24H13L11 16z" />
      <path d="M18 16v-3a6 6 0 0 1 12 0v3" strokeLinecap="round" />
      <path d="M31 25l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 29h18" strokeLinecap="round" />
    </svg>
  );
}

function IconDeliver() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 14h22v18H4z" />
      <path d="M26 20h10l6 6v6H26z" />
      <circle cx="14" cy="36" r="3.5" />
      <circle cx="34" cy="36" r="3.5" />
    </svg>
  );
}

function IconReturn() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 13h30v26H9z" />
      <path d="M9 21h30" />
      <path d="M17 9v8M31 9v8" strokeLinecap="round" />
      <path d="M20 30h8l-2-2M28 30l-2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
