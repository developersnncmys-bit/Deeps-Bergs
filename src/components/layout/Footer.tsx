import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

const customerCare = [
  { label: "Order Status", href: "/account/orders" },
  { label: "Shipping & Delivery", href: "/policies/shipping" },
  { label: "Returns & Exchanges", href: "/policies/returns" },
  { label: "How Rentals Work", href: "/help#rentals" },
  { label: "Size Guide", href: "/help/size-guide" },
  { label: "Contact Us", href: "/account/tickets/new" },
  { label: "Help Center", href: "/help" },
];

const theHouse = [
  { label: "Our Story", href: "/about" },
  { label: "Sustainability", href: "/about/sustainability" },
  { label: "Careers", href: "/careers" },
  { label: "Stylist Services", href: "/stylist" },
  { label: "Membership", href: "/account/membership" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr_1fr_0.9fr] lg:gap-10 lg:py-20">
        {/* 1 — Newsletter / contacts */}
        <div className="flex flex-col gap-5">
          <h4 className="font-sans text-xl uppercase tracking-[0.08em] text-white">
            First looks, early drops
          </h4>
          <p className="max-w-sm text-sm text-white/70">
            Drop-days, atelier previews and early access to limited editions —
            straight to your inbox.
          </p>

          <form className="mt-2 flex flex-col gap-3" aria-label="Subscribe to Deeps & Bergs updates">
            <SubscribeField
              id="footer-email"
              type="email"
              name="email"
              placeholder="Email address"
              label="Email address"
            />
            <SubscribeField
              id="footer-phone"
              type="tel"
              name="phone"
              placeholder="Phone number"
              label="Phone number"
            />
          </form>

          <p className="max-w-sm text-[11px] leading-relaxed text-white/50">
            By subscribing you agree to receive promotional messages from Deeps
            &amp; Bergs via email and WhatsApp. Consent is not a condition of
            purchase. Reply <span className="font-semibold">STOP</span> to
            unsubscribe. See our{" "}
            <Link href="/policies/privacy" className="underline underline-offset-2 hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* 2 — Customer care */}
        <div className="flex flex-col gap-5">
          <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-white">
            Customer Care
          </h4>
          <div className="flex flex-col gap-1 text-sm text-white/75">
            <p>Mon–Sat, 10am–7pm IST</p>
            <p className="mt-2">
              <a href="mailto:care@deepsbergs.com" className="hover:text-white">
                care@deepsbergs.com
              </a>
            </p>
            <p>
              <a href="tel:+918040000000" className="hover:text-white">
                +91 80 4000 0000
              </a>
            </p>
          </div>

          <ul className="mt-2 flex flex-col gap-3">
            {customerCare.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-white/85 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3 — The House */}
        <div className="flex flex-col gap-5">
          <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-white">
            The House
          </h4>
          <p className="max-w-xs text-sm text-white/70">
            A commerce, rental and AI platform for Indian fashion. Buy the
            pieces you&apos;ll keep. Rent the ones you won&apos;t. Try
            everything on without leaving home.
          </p>

          <ul className="mt-2 flex flex-col gap-3">
            {theHouse.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-white/85 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 4 — Portrait */}
        <div className="relative hidden aspect-[4/5] overflow-hidden lg:block">
          <Image
            src="/images/category/bridal.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 24vw, 100vw"
            className="object-cover"
          />
        </div>
      </Container>

      {/* Socials + legal */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <SocialLink href="https://instagram.com" label="Instagram">
              <IconInstagram />
            </SocialLink>
            <SocialLink href="https://youtube.com" label="YouTube">
              <IconYouTube />
            </SocialLink>
            <SocialLink href="https://pinterest.com" label="Pinterest">
              <IconPinterest />
            </SocialLink>
            <SocialLink href="https://wa.me/918040000000" label="WhatsApp">
              <IconWhatsApp />
            </SocialLink>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>© 2026 Deeps &amp; Bergs Fashion</span>
            <Link href="/policies/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/policies/terms" className="hover:text-white">Terms of Use</Link>
            <Link href="/policies/cookies" className="hover:text-white">Cookies</Link>
            <span className="text-white/40">
              Designed &amp; developed by{" "}
              <a
                href="https://www.nakshatranamahacreations.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Nakshatra Namaha Creations
              </a>
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function SubscribeField({
  id,
  label,
  ...rest
}: {
  id: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        className="h-12 w-full border border-white/40 bg-transparent px-4 pr-12 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
        {...rest}
      />
      <button
        type="submit"
        aria-label={`Submit ${label.toLowerCase()}`}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
      >
        <ArrowRight />
      </button>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-white/70 transition-colors hover:text-white"
    >
      {children}
    </a>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconPinterest() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M11 8c2.5 0 4 1.6 4 3.8 0 2.4-1.5 4-3.4 4-.9 0-1.6-.4-1.9-1l-.4 1.6c-.3 1-1 2.2-1.5 3" strokeLinecap="round" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.3A9 9 0 1 1 21 12z" strokeLinejoin="round" />
      <path d="M8.5 9.5c0 3.5 2.5 6 6 6 .7 0 1.2-.1 1.6-.4l-1.4-1.4c-.3.2-.6.3-1 .3-1.5 0-3.6-2.1-3.6-3.6 0-.4.1-.7.3-1L9 7.9c-.3.4-.5.9-.5 1.6z" strokeLinejoin="round" />
    </svg>
  );
}
