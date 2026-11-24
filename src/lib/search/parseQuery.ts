import type { Product } from "@/lib/types";

/**
 * Mock "AI" query parser for A03 Smart Search.
 * In production this is handled by an LLM + embeddings call. Here we just scan
 * the query for well-known tokens so the chips + result list feel believable.
 * Keep the output shape stable — swap the implementation when wiring the API.
 */

export type ParsedFacet = {
  type: "occasion" | "colour" | "category" | "mode" | "budget";
  label: string;
  value: string;
};

const OCCASIONS = [
  "wedding",
  "reception",
  "sangeet",
  "mehendi",
  "cocktail",
  "festive",
  "daywear",
  "workwear",
  "brunch",
  "lounge",
  "workout",
];

const COLOURS = [
  "red",
  "ivory",
  "emerald",
  "wine",
  "rose",
  "charcoal",
  "midnight",
  "pearl",
  "beige",
  "terracotta",
  "saffron",
  "sage",
  "olive",
  "teal",
  "blush",
  "rosewood",
];

const CATEGORIES: Record<string, string> = {
  lehenga: "Lehenga",
  saree: "Saree",
  sarees: "Saree",
  sherwani: "Sherwani",
  bandhgala: "Bandhgala",
  bandi: "Bandi",
  jacket: "Jacket",
  kurta: "Kurta",
  "co-ord": "Co-ord",
  coord: "Co-ord",
  shirt: "Shirt",
  trouser: "Trouser",
  trousers: "Trouser",
  dress: "Dress",
  tank: "Tank",
  legging: "Legging",
  hoodie: "Hoodie",
};

const NUMBER_WORDS: Record<string, number> = {
  thousand: 1000,
  lakh: 100000,
  k: 1000,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  hundred: 100,
};

/** "under 20k", "under twenty thousand", "below ₹25000" → number in rupees */
function parseBudget(q: string): number | null {
  const lower = q.toLowerCase();
  // 1) explicit "under 20k" / "under ₹20000" / "below 25,000"
  const direct = lower.match(/(under|below|less than|upto)\s*₹?\s*([\d,]+)\s*(k|thousand|lakh)?/);
  if (direct) {
    let n = Number(direct[2].replace(/,/g, ""));
    const unit = direct[3];
    if (unit === "k" || unit === "thousand") n *= 1000;
    if (unit === "lakh") n *= 100000;
    if (!Number.isNaN(n)) return n;
  }
  // 2) spelled out: "under twenty thousand"
  const words = lower.match(/(under|below|less than|upto)\s+([a-z]+)\s+(thousand|lakh)/);
  if (words) {
    const base = NUMBER_WORDS[words[2]];
    const unit = NUMBER_WORDS[words[3]];
    if (base && unit) return base * unit;
  }
  return null;
}

export function parseQuery(raw: string): {
  query: string;
  facets: ParsedFacet[];
  budget: number | null;
} {
  const q = raw.trim();
  const lower = q.toLowerCase();
  const facets: ParsedFacet[] = [];

  for (const occ of OCCASIONS) {
    if (lower.includes(occ)) {
      facets.push({
        type: "occasion",
        label: cap(occ),
        value: occ,
      });
    }
  }
  for (const col of COLOURS) {
    if (lower.includes(col)) {
      facets.push({ type: "colour", label: cap(col), value: col });
    }
  }
  for (const [tok, label] of Object.entries(CATEGORIES)) {
    if (lower.includes(tok)) {
      // de-dupe when multiple tokens map to the same category
      if (!facets.some((f) => f.type === "category" && f.label === label)) {
        facets.push({ type: "category", label, value: tok });
      }
    }
  }
  if (/\brent(al)?\b/.test(lower)) {
    facets.push({ type: "mode", label: "Rent", value: "rent" });
  } else if (/\bbuy\b/.test(lower)) {
    facets.push({ type: "mode", label: "Buy", value: "buy" });
  }

  const budget = parseBudget(lower);
  if (budget) {
    facets.push({
      type: "budget",
      label: `Under ₹${budget.toLocaleString("en-IN")}`,
      value: String(budget),
    });
  }

  return { query: q, facets, budget };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Mock ranking — score each product against the parsed facets.
 * Replace with embeddings nearest-neighbour when backing with a real vector DB.
 */
export function rankProducts(
  products: Product[],
  facets: ParsedFacet[],
  budget: number | null,
): Product[] {
  if (!facets.length && budget == null) return products;

  const scored = products.map((p) => {
    let score = 0;
    const hay = [
      p.name,
      p.description ?? "",
      ...(p.occasion ?? []),
      ...(p.categoryIds ?? []),
      p.sectionId,
      ...(p.variants ?? []).map((v) => `${v.color} ${v.size}`),
    ]
      .join(" ")
      .toLowerCase();

    for (const f of facets) {
      if (f.type === "budget") continue;
      if (hay.includes(f.value.toLowerCase())) score += f.type === "category" ? 3 : 2;
    }
    if (budget != null && p.price != null && p.price <= budget) score += 1;
    if (budget != null && p.price != null && p.price > budget) score -= 2;
    return { p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.p);
}
