"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TbPlus, TbMinus } from "react-icons/tb";
import { categories, products } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { formatINR } from "@/lib/utils";

const MENS_CATS = new Set(["sherwani", "groomswear", "sherwani-silk", "sherwani-velvet", "shirts"]);
const WOMENS_CATS = new Set([
  "lehenga",
  "lehenga-bridal",
  "lehenga-reception",
  "lehenga-mehendi",
  "bridal-saree",
  "sarees",
  "kurtas",
  "co-ords",
  "dresses",
]);

type Gender = "women" | "men";

const COPY: Record<
  Gender,
  { hero: string; subhead: string; eyebrow: string; cover: string }
> = {
  women: {
    eyebrow: "Shop Women",
    hero: "For Her.",
    subhead:
      "From bridal couture to the quiet luxe of a weekday saree — the full edit of pieces made for her.",
    cover: "/images/chapterv1.png",
  },
  men: {
    eyebrow: "Shop Men",
    hero: "For Him.",
    subhead:
      "Sherwanis, bandhgalas, and off-duty tailoring — the full edit of pieces made for him.",
    cover: "/images/chapter2.png",
  },
};

type Story = {
  quote: string;
  name: string;
  location: string;
  image: string;
  productSlug?: string;
};

const STORIES: Record<Gender, Story[]> = {
  women: [
    {
      quote:
        "The silhouette is unreal — I had three people ask who I was wearing within the first hour. Fit true to size on the first try.",
      name: "Aarushi Mehta",
      location: "Mumbai, Maharashtra",
      image: "/images/3d/women-model/w-v1.png",
      productSlug: "amara-bridal-lehenga",
    },
    {
      quote:
        "Delivered on time, fit perfectly, and the chikankari detail is exactly what I was promised. Worth every rupee.",
      name: "Shradha Patel",
      location: "Bengaluru, Karnataka",
      image: "/images/3d/women-model/w-v2.png",
      productSlug: "ivory-chikankari-saree",
    },
    {
      quote:
        "Rented it for a sangeet and couldn't believe the quality — it felt like something I'd bought. Pickup was effortless too.",
      name: "Divya Krishnan",
      location: "Chennai, Tamil Nadu",
      image: "/images/3d/women-model/w-v3.png",
      productSlug: "terracotta-co-ord",
    },
    {
      quote:
        "The stitching is immaculate. I've worn it twice already and it still hangs like it did the day it arrived.",
      name: "Ritika Sharma",
      location: "Delhi, NCR",
      image: "/images/3d/women-model/w-v4.png",
    },
  ],
  men: [
    {
      quote:
        "The sherwani fit my frame perfectly — no tailor visit needed. Compliments all night at my cousin's wedding.",
      name: "Rohan Deshpande",
      location: "Pune, Maharashtra",
      image: "/images/3d/women-model/w-v6.png",
      productSlug: "midnight-zardozi-sherwani",
    },
    {
      quote:
        "I went in skeptical about the colour and came out a convert. The bandhgala structure is impeccable.",
      name: "Arjun Nair",
      location: "Kochi, Kerala",
      image: "/images/3d/women-model/w-v7.png",
      productSlug: "ivory-pearl-bandhgala",
    },
    {
      quote:
        "Easily the sharpest piece I own. Delivered in three days, no alterations needed.",
      name: "Karan Bhatia",
      location: "Gurugram, Haryana",
      image: "/images/3d/women-model/w-v8.png",
    },
    {
      quote:
        "Hand-stitched detail you can feel. I rented for a reception and will be back for Diwali.",
      name: "Ishaan Rao",
      location: "Hyderabad, Telangana",
      image: "/images/3d/women-model/w-v9.png",
    },
  ],
};

type EditorialSection = {
  heading: string;
  body: string;
  subheading?: string;
  subbody?: string;
  bullets?: { title: string; copy: string }[];
};

type TabGroup = { label: string; pills: { label: string; href: string }[] };

type Faq = { q: string; a: string };

const EDITORIAL: Record<Gender, EditorialSection> = {
  women: {
    heading: "Women's Indian Wear: Shop Premium Styles at Deeps & Bergs",
    body:
      "Deeps & Bergs brings together the quietest luxury of Indian craftsmanship with silhouettes designed for the way women actually live today. Every piece in the women's edit — from bridal lehengas to weekday co-ords — is small-batch, hand-finished, and cut for the real body. Browse the full collection to see what fits your calendar, from intimate ceremonies to everyday polish.",
    subheading: "Explore Ethnic Styles in Trendy & Timeless Silhouettes",
    subbody:
      "Whether it's a saree reinterpreted for a cocktail evening or a kurta set made for a Sunday brunch, the women's catalogue spans heirloom and contemporary without compromising either. Fabrics are sourced from karigars across India, and finishes are checked piece-by-piece before they leave the atelier.",
    bullets: [
      {
        title: "Ethnic Dresses for Women: Modern, Festive & Occasion-Ready",
        copy: "Anarkalis, zardozi-embellished suits and embroidered sarees — the pieces you reach for when the invitation says black-tie Indian.",
      },
      {
        title: "Everyday Luxe: Kurtas, Co-ords & Dresses",
        copy: "Soft fabrics, considered cuts, and pieces that outlive a trend cycle — made for the woman who dresses for herself first.",
      },
      {
        title: "Bridal & Trousseau: One-of-One Heirlooms",
        copy: "Bridal lehengas, reception gowns and heirloom sarees — each commissioned with a named karigar and documented stitch-by-stitch.",
      },
    ],
  },
  men: {
    heading: "Men's Indian Wear: Shop Premium Styles at Deeps & Bergs",
    body:
      "Deeps & Bergs tailors Indian occasion-wear for the modern man — sharp sherwanis, bandhgalas and kurtas cut on a contemporary block. Every piece from the men's edit is stitched in our atelier, measured against real body data (not off-the-rack sizing), and finished with details you can feel from across the room.",
    subheading: "Explore Sherwanis, Bandhgalas & Off-Duty Tailoring",
    subbody:
      "From groom-ready embroidered sherwanis to clean Nehru jackets you'll wear a hundred times, the men's catalogue leans quiet luxury over costume. Fabrics are sourced from Indian mills, embroidery from karigars we've worked with for years.",
    bullets: [
      {
        title: "Groom & Reception: Sherwanis, Bandhgalas, Indo-Western",
        copy: "The pieces the groom (and his party) actually ends up in the photos wearing. Trial fittings included.",
      },
      {
        title: "Everyday Festive: Kurtas, Jackets, Co-ords",
        copy: "Linen kurtas, textured Nehru jackets, co-ord sets for the Sunday house parties and the Diwali dinners.",
      },
      {
        title: "Made-to-Measure: Fit, Fabric, Done Right",
        copy: "Pick the fabric, book a fitting, approve the muslin. Final piece is yours in 3-5 weeks depending on embroidery.",
      },
    ],
  },
};

const TABS: Record<Gender, TabGroup[]> = {
  women: [
    {
      label: "Popular Search",
      pills: [
        { label: "Bridal Lehenga", href: "/c/lehenga-bridal" },
        { label: "Chikankari Saree", href: "/c/sarees" },
        { label: "Embroidered Kurta Set", href: "/c/kurtas" },
        { label: "Reception Gown", href: "/c/dresses" },
        { label: "Mehendi Co-ord", href: "/c/co-ords" },
        { label: "Pastel Saree", href: "/c/sarees" },
      ],
    },
    {
      label: "Shop By Color",
      pills: [
        { label: "Ivory", href: "/shop" },
        { label: "Rose", href: "/shop" },
        { label: "Emerald", href: "/shop" },
        { label: "Midnight", href: "/shop" },
        { label: "Mustard", href: "/shop" },
        { label: "Blush", href: "/shop" },
      ],
    },
    {
      label: "Shop By Occasion",
      pills: [
        { label: "Bridal", href: "/shop" },
        { label: "Reception", href: "/shop" },
        { label: "Mehendi", href: "/shop" },
        { label: "Sangeet", href: "/shop" },
        { label: "Daywear", href: "/shop" },
        { label: "Cocktail", href: "/shop" },
      ],
    },
    {
      label: "Shop By Price",
      pills: [
        { label: "Under ₹5,000", href: "/shop" },
        { label: "₹5,000 — ₹15,000", href: "/shop" },
        { label: "₹15,000 — ₹50,000", href: "/shop" },
        { label: "Above ₹50,000", href: "/shop" },
      ],
    },
  ],
  men: [
    {
      label: "Popular Search",
      pills: [
        { label: "Groom Sherwani", href: "/c/sherwanis" },
        { label: "Bandhgala Set", href: "/c/groomswear" },
        { label: "Zardozi Sherwani", href: "/c/sherwani-velvet" },
        { label: "Silk Kurta", href: "/shop" },
        { label: "Nehru Jacket", href: "/shop" },
        { label: "Indo-Western", href: "/shop" },
      ],
    },
    {
      label: "Shop By Color",
      pills: [
        { label: "Ivory", href: "/shop" },
        { label: "Midnight", href: "/shop" },
        { label: "Emerald", href: "/shop" },
        { label: "Rose Beige", href: "/shop" },
        { label: "Charcoal", href: "/shop" },
        { label: "Gold", href: "/shop" },
      ],
    },
    {
      label: "Shop By Occasion",
      pills: [
        { label: "Groom", href: "/shop" },
        { label: "Reception", href: "/shop" },
        { label: "Sangeet", href: "/shop" },
        { label: "Festive", href: "/shop" },
        { label: "Daywear", href: "/shop" },
        { label: "Cocktail", href: "/shop" },
      ],
    },
    {
      label: "Shop By Price",
      pills: [
        { label: "Under ₹10,000", href: "/shop" },
        { label: "₹10,000 — ₹30,000", href: "/shop" },
        { label: "₹30,000 — ₹1,00,000", href: "/shop" },
        { label: "Above ₹1,00,000", href: "/shop" },
      ],
    },
  ],
};

const FAQS: Record<Gender, Faq[]> = {
  women: [
    {
      q: "What's included in women's ethnic wear at Deeps & Bergs?",
      a: "The women's edit covers lehengas, sarees, kurtas & sets, co-ords, bridal sarees and dresses — spanning everyday, festive and bridal occasions.",
    },
    {
      q: "Which colours are trending in women's wear this season?",
      a: "Ivory, rose, emerald and quiet pastels lead the current drop — with hand-embroidered detailing taking the place of heavy embellishment.",
    },
    {
      q: "What fabrics do you work with?",
      a: "Primarily Indian handwoven silks, pure chiffons, georgettes and organic cottons — sourced directly from karigars across India.",
    },
    {
      q: "How do I style occasion wear for festive and bridal functions?",
      a: "Our stylists can build a full look — ping a stylist through the Stylist tab or book a free consultation from the Membership page.",
    },
    {
      q: "Do you offer made-to-measure for women?",
      a: "Yes — most pieces in the Luxe and Bridal categories can be made to measure. Allow 3–6 weeks depending on embroidery.",
    },
    {
      q: "What's the difference between festive wear and bridal wear?",
      a: "Bridal pieces are commissioned one-of-one with named karigars and extensive documentation; festive wear is small-batch but not single-commission.",
    },
  ],
  men: [
    {
      q: "What's included in men's ethnic wear at Deeps & Bergs?",
      a: "Sherwanis (silk and velvet), bandhgalas, groomswear, kurta sets, Nehru jackets and shirts — festive, wedding and daywear.",
    },
    {
      q: "Which cuts are most popular for grooms?",
      a: "Mid-length structured sherwanis and clean bandhgalas continue to lead groom demand — paired with slim-fit pyjamas or tapered trousers.",
    },
    {
      q: "Do you offer made-to-measure for grooms?",
      a: "Yes — most sherwanis and bandhgalas are made-to-measure. Book a fitting via the Stylist page; final delivery is 3–5 weeks.",
    },
    {
      q: "How do I style for wedding functions?",
      a: "A stylist can build a function-by-function wardrobe (mehendi, sangeet, haldi, nikaah/pheras, reception) — reach out through the Stylist tab.",
    },
    {
      q: "What fabrics are used in the men's edit?",
      a: "Raw silk, handwoven brocades, fine wool blends for winter weddings, and breathable linen-cottons for daywear.",
    },
    {
      q: "Can I rent men's occasion wear?",
      a: "Yes — select pieces are available on 3, 5 and 7-day rentals via the Rent tab. Dry-cleaning and shipping both ways are included.",
    },
  ],
};

function productMatchesGender(p: Product, g: Gender): boolean {
  const ids = p.categoryIds;
  const isMen = ids.some((id) => MENS_CATS.has(id));
  const isWomen = ids.some((id) => WOMENS_CATS.has(id));
  if (g === "women") return isWomen || (!isMen && !isWomen);
  return isMen || (!isMen && !isWomen);
}

export function GenderLanding({ gender }: { gender: Gender }) {
  const copy = COPY[gender];
  const genderSet = gender === "women" ? WOMENS_CATS : MENS_CATS;

  // Top-level categories only (no sub-categories), gender-matched, with images.
  const genderCategories = categories.filter(
    (c) => !c.parentId && genderSet.has(c.id) && c.image,
  );

  const trending = products
    .filter((p) => productMatchesGender(p, gender))
    .slice(0, 10);

  const stories = STORIES[gender];
  const editorial = EDITORIAL[gender];
  const tabs = TABS[gender];
  const faqs = FAQS[gender];

  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const onStoriesScroll = () => {
    const el = storiesRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-story-idx]");
    const scrollLeft = el.scrollLeft;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveStoryIdx(closest);
  };
  const scrollToStory = (i: number) => {
    const el = storiesRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(`[data-story-idx="${i}"]`);
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  const trendingRef = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div className="bg-white pb-20">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0">
          <Image
            src={copy.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          {/* Dark gradient from the left so the left-aligned copy stays legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        </div>
        <Container>
          <div
            className="relative flex max-w-2xl flex-col items-start justify-center gap-6 py-24 text-left"
            style={{ minHeight: "calc(70vh - 30px)" }}
          >
            <p
              style={{ fontFamily: "var(--font-raleway)" }}
              className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/85"
            >
              {copy.eyebrow}
            </p>
            <h1
              style={{ fontFamily: "var(--font-raleway)" }}
              className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02]"
            >
              {copy.hero}
            </h1>
            <p className="max-w-lg text-sm text-white/85 sm:text-base">
              {copy.subhead}
            </p>
            <Link
              href="/shop"
              style={{ fontFamily: "var(--font-raleway)" }}
              className="mt-2 inline-flex items-center gap-2 bg-white px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white/90"
            >
              Shop the Edit
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Shop by Category ── */}
      <section className="pt-14 sm:pt-16 lg:pt-20">
        <div className="mb-8 text-center sm:mb-10">
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-xl uppercase tracking-[0.1em] text-ink sm:text-2xl"
          >
            {gender === "women" ? "For Her" : "For Him"}
          </h2>
        </div>

        {/* Centered flex row — swap back to the carousel + arrows once
            the admin adds enough categories to overflow a desktop row. */}
        <div className="flex flex-wrap items-start justify-center gap-6 px-4 sm:gap-8 sm:px-6 lg:gap-10 lg:px-10">
          {genderCategories.map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.slug}`}
              className="group flex w-[140px] shrink-0 flex-col items-center gap-3 sm:w-[160px] lg:w-[180px]"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full bg-surface ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-[1.03]">
                <Image
                  src={c.image!}
                  alt={c.name}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <p
                style={{ fontFamily: "var(--font-raleway)" }}
                className="text-center text-sm font-semibold uppercase tracking-[0.1em] text-ink group-hover:text-brand sm:text-base"
              >
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending Styles ── */}
      <section className="mt-16 sm:mt-20 lg:mt-24">
        <div className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-2 text-center sm:mb-10">
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-xl uppercase tracking-[0.1em] text-ink sm:text-2xl"
          >
            What&apos;s moving this week
          </h2>
        </div>

        <div className="relative">
          <div className="overflow-hidden px-4 sm:px-6 lg:px-10">
            <div
              ref={trendingRef}
              className="no-scrollbar overflow-x-auto scroll-smooth"
            >
              <div className="flex gap-4 sm:gap-5 lg:gap-6">
                {trending.map((p) => (
                  <div
                    key={p.id}
                    className="w-[220px] shrink-0 sm:w-[260px] lg:w-[300px]"
                  >
                    <TrendingCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CarouselArrow
            direction="left"
            ariaLabel="Scroll trending left"
            onClick={() => scrollBy(trendingRef, -1)}
            className="left-4 sm:left-6 lg:left-10"
          />
          <CarouselArrow
            direction="right"
            ariaLabel="Scroll trending right"
            onClick={() => scrollBy(trendingRef, 1)}
            className="right-4 sm:right-6 lg:right-10"
          />
        </div>
      </section>

      {/* ── Customer Stories ── */}
      <section className="mt-16 sm:mt-20 lg:mt-24">
        <div className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-2 text-center sm:mb-10">
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-xl uppercase tracking-[0.1em] text-ink sm:text-2xl"
          >
            Customer Stories
          </h2>
        </div>

        <div className="relative">
          <div className="overflow-hidden px-4 sm:px-6 lg:px-10">
            <div
              ref={storiesRef}
              onScroll={onStoriesScroll}
              className="no-scrollbar overflow-x-auto scroll-smooth"
            >
              <div className="flex gap-6 sm:gap-8 lg:gap-10">
                {stories.map((s, i) => (
                  <StoryCard key={i} story={s} idx={i} />
                ))}
              </div>
            </div>
          </div>

          <CarouselArrow
            direction="left"
            ariaLabel="Scroll stories left"
            onClick={() => scrollBy(storiesRef, -1)}
            className="left-4 sm:left-6 lg:left-10"
          />
          <CarouselArrow
            direction="right"
            ariaLabel="Scroll stories right"
            onClick={() => scrollBy(storiesRef, 1)}
            className="right-4 sm:right-6 lg:right-10"
          />
        </div>

        {/* Dot indicators — one per story, active dot tracks the scroll position */}
        <div className="mt-6 flex items-center justify-center gap-2 sm:mt-8">
          {stories.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToStory(i)}
              aria-label={`Go to story ${i + 1}`}
              aria-current={i === activeStoryIdx}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === activeStoryIdx
                  ? "w-6 bg-ink"
                  : "w-1.5 bg-ink/25 hover:bg-ink/50")
              }
            />
          ))}
        </div>
      </section>

      {/* ── Editorial content (SEO body) ── */}
      <section className="mt-20 sm:mt-24 lg:mt-28">
        <div className="px-4 sm:px-6 lg:px-10">
          <div>
            <h2
              style={{ fontFamily: "var(--font-raleway)" }}
              className="text-xl leading-[1.25] text-ink sm:text-2xl lg:text-[1.75rem]"
            >
              {editorial.heading}
            </h2>
            <p className="mt-5 text-sm leading-[1.75] text-ink-muted sm:text-base">
              {editorial.body}
            </p>

            {editorial.subheading && (
              <>
                <h3
                  style={{ fontFamily: "var(--font-raleway)" }}
                  className="mt-10 text-lg leading-[1.3] text-ink sm:text-xl"
                >
                  {editorial.subheading}
                </h3>
                {editorial.subbody && (
                  <p className="mt-4 text-sm leading-[1.75] text-ink-muted sm:text-base">
                    {editorial.subbody}
                  </p>
                )}
              </>
            )}

            {editorial.bullets && (
              <ul className="mt-8 flex flex-col gap-4">
                {editorial.bullets.map((b) => (
                  <li
                    key={b.title}
                    className="flex gap-3 text-sm leading-[1.6] text-ink-muted sm:text-base"
                  >
                    <span aria-hidden className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-ink" />
                    <span>
                      <strong className="font-semibold text-ink">
                        {b.title}:
                      </strong>{" "}
                      {b.copy}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Popular Search / Shop By tabs ── */}
      <section className="mt-16 sm:mt-20">
        <div className="px-4 sm:px-6 lg:px-10">
          <ShopByTabs tabs={tabs} />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mt-16 sm:mt-20 lg:mt-24">
        <div className="px-4 sm:px-6 lg:px-10">
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-center text-xl uppercase tracking-[0.1em] text-ink sm:text-2xl"
          >
            FAQ&apos;s
          </h2>
          <FaqGrid faqs={faqs} />
        </div>
      </section>
    </div>
  );
}

function ShopByTabs({ tabs }: { tabs: TabGroup[] }) {
  const [active, setActive] = useState(0);
  const current = tabs[active];
  return (
    <div>
      {/* Tab row — individual grey cells with gaps between, matching the Kalki layout */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setActive(i)}
            style={{ fontFamily: "var(--font-raleway)" }}
            className={
              "px-5 py-5 text-center text-base font-medium transition-colors " +
              (i === active
                ? "bg-[#e5e5e5] text-ink"
                : "bg-[#f3f3f3] text-ink-muted hover:bg-[#e9e9e9] hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pills row — on the same light-grey backdrop as the active tab */}
      <div className="mt-3 flex flex-wrap items-center gap-3 bg-[#f3f3f3] p-6 sm:gap-4 sm:p-8">
        {current.pills.map((p) => (
          <Link
            key={p.label}
            href={p.href}
            className="inline-flex items-center rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FaqGrid({ faqs }: { faqs: Faq[] }) {
  // Two-column grid on desktop; items flow column-first so pairs sit side-by-side.
  return (
    <div className="mt-10 grid grid-cols-1 gap-x-10 border-t border-line lg:grid-cols-2">
      {faqs.map((f, i) => (
        <FaqItem key={i} q={f.q} a={f.a} />
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left text-sm font-medium text-ink transition-colors hover:text-brand sm:text-base"
      >
        <span>{q}</span>
        {open ? (
          <TbMinus size={18} className="shrink-0 text-ink" />
        ) : (
          <TbPlus size={18} className="shrink-0 text-ink" />
        )}
      </button>
      {open && (
        <p className="pb-5 pr-8 text-sm leading-[1.6] text-ink-muted">{a}</p>
      )}
    </div>
  );
}

function StoryCard({ story, idx }: { story: Story; idx: number }) {
  return (
    <article
      data-story-idx={idx}
      className="flex w-[min(92vw,880px)] shrink-0 flex-col gap-6 border border-line bg-surface sm:h-[360px] sm:flex-row sm:gap-0 lg:h-[400px]"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full shrink-0 bg-ink sm:aspect-auto sm:h-full sm:w-[260px] lg:w-[300px]">
        <Image
          src={story.image}
          alt={story.name}
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 260px, 92vw"
          className="object-cover"
        />
        {story.productSlug && (
          <Link
            href={`/p/${story.productSlug}`}
            style={{ fontFamily: "var(--font-raleway)" }}
            className="absolute bottom-4 left-4 right-4 inline-flex items-center justify-center bg-white/95 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white sm:bottom-5 sm:left-5 sm:right-5"
          >
            View Product
          </Link>
        )}
      </div>

      {/* Quote + attribution */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <p className="font-serif text-base italic leading-[1.5] text-ink sm:text-lg lg:text-xl">
          “{story.quote}”
        </p>
        <div className="flex flex-col items-center gap-1">
          <p
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-sm font-bold uppercase tracking-[0.15em] text-ink"
          >
            {story.name}
          </p>
          <p className="text-xs text-ink-muted">{story.location}</p>
        </div>
      </div>
    </article>
  );
}

function CarouselArrow({
  direction,
  ariaLabel,
  onClick,
  className = "",
}: {
  direction: "left" | "right";
  ariaLabel: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        "absolute top-[43%] z-10 hidden h-14 w-10 -translate-y-1/2 items-center justify-center bg-white text-ink shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-colors hover:bg-white/95 sm:flex " +
        className
      }
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path
          d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function TrendingCard({ product }: { product: Product }) {
  const minRental = product.rentalPricing?.[0];
  return (
    <Link href={`/p/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <h3 className="line-clamp-1 text-sm text-ink group-hover:text-brand sm:text-base">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          {product.price != null ? (
            <span className="text-sm font-semibold text-ink">
              {formatINR(product.price)}
            </span>
          ) : minRental ? (
            <span className="text-sm font-semibold text-ink">
              Rent from {formatINR(minRental.price)}
            </span>
          ) : null}
          {product.mrp && product.price && product.mrp > product.price && (
            <span className="text-xs text-ink-subtle line-through">
              {formatINR(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
