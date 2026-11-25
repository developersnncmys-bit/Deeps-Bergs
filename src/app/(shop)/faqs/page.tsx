import Link from "next/link";

type FaqGroup = {
  title: string;
  items: { q: string; a: string }[];
};

const groups: FaqGroup[] = [
  {
    title: "Orders & Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards, UPI, net-banking, and wallet-based payments through Razorpay. International cards are supported for select regions.",
      },
      {
        q: "Will I receive a GST invoice?",
        a: "Yes. A GST-compliant invoice is emailed to you after dispatch and is also downloadable from your Orders page.",
      },
      {
        q: "Can I modify my order after placing it?",
        a: "Address or size changes are possible until the order moves to the Packed state. Reach us on WhatsApp within an hour and we'll do our best to help.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "Is shipping free?",
        a: "Shipping is complimentary on orders above ₹3,000. Below that a flat fee of ₹150 applies and is shown at checkout.",
      },
      {
        q: "How long does delivery take?",
        a: "Ready-to-ship pieces arrive in 3–5 working days. Made-to-order pieces list their lead time on the product page. Rentals arrive the day before your start date.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship to select countries at checkout. International rentals are not available at this time.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What if I want to exchange or return my order?",
        a: "Exchanges and returns are available within 5 days of delivery. Items must be in original condition with tags intact. Custom-made and final-sale pieces are not eligible.",
      },
      {
        q: "How do I start a return?",
        a: "Head to your Orders page, open the order and tap 'Return'. We'll arrange a reverse pickup and refund you within 5 working days of receiving the item in good condition.",
      },
    ],
  },
  {
    title: "Rentals",
    items: [
      {
        q: "How do rentals work?",
        a: "Pick a piece, choose your dates and duration, and pay the rental charge plus a refundable deposit. We deliver the dry-cleaned piece a day before your start date, and you return it in the prepaid bag we include.",
      },
      {
        q: "When is my deposit refunded?",
        a: "The full refundable deposit is credited back to your original payment method within 3 working days of our team receiving and inspecting the returned piece.",
      },
      {
        q: "Can I cancel or extend a rental?",
        a: "Cancellations are honoured per our rental policy. Extensions are possible if the piece is not already booked by another customer for the following window.",
      },
      {
        q: "What if the piece arrives damaged or doesn't fit?",
        a: "Reach us within 24 hours of delivery via WhatsApp or the Order page. Pre-existing damage is noted and will not be charged to you. For fit issues, you can swap for your backup size if we have one available.",
      },
    ],
  },
  {
    title: "Product & Quality",
    items: [
      {
        q: "Will I receive a quality product by Deeps & Bergs?",
        a: "Every piece goes through a 5-step quality control process — fabric inspection, stitching review, finishing check, final steam, and QC sign-off — before it ships.",
      },
      {
        q: "How do I pick the right size?",
        a: "Each product page has a Size Guide with measurements. If you're between sizes, our stylists on WhatsApp will help you choose.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <div className="bg-white pb-20">
      <nav className="mx-auto max-w-[900px] px-4 pt-8 text-[11px] uppercase tracking-[0.2em] text-ink-muted sm:px-6">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">FAQs</span>
      </nav>

      <header className="mx-auto max-w-[900px] px-4 pb-10 pt-6 text-center sm:px-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
          Help Centre
        </p>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Can&apos;t find your answer? Message our stylist team on WhatsApp — we
          usually respond within 10 minutes during store hours.
        </p>
      </header>

      <div className="mx-auto max-w-[900px] space-y-10 px-4 sm:px-6">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-4 font-serif text-xl text-ink sm:text-2xl">
              {group.title}
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {group.items.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-sm font-semibold text-ink">
                    {item.q}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center text-ink transition-transform group-open:rotate-45">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
