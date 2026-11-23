import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { creators } from "@/lib/mock-data";

export function ChapterCreators() {
  return (
    <section
      id="chapter-creators"
      className="scroll-mt-20 border-t border-line bg-[#f2ece2] py-20 sm:py-28 lg:py-36"
    >
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="font-sans text-6xl text-brand">04</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
                Our creators
              </span>
            </div>
            <h2 className="max-w-[16ch] text-[clamp(2.25rem,5vw,4rem)] leading-[1.05]">
              Shop looks by the people who made them.
            </h2>
            <p className="max-w-md text-lg text-ink-muted">
              Editors, stylists and tailors curate capsules you can shop as
              whole outfits — or piece by piece.
            </p>
          </div>
          <LinkButton href="/creators" size="md" variant="outline">
            Browse all creators
          </LinkButton>
        </div>
      </Container>

      <div className="mt-12 overflow-x-auto no-scrollbar">
        <div className="flex gap-5 px-4 pb-4 sm:px-6 lg:px-10">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/creators/${c.handle}`}
              className="group relative flex aspect-[3/4] w-[78vw] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] bg-surface sm:w-[46vw] lg:w-[28vw] xl:w-[380px]"
            >
              <Image
                src={c.cover}
                alt={c.name}
                fill
                sizes="(min-width: 1280px) 380px, (min-width: 1024px) 28vw, (min-width: 640px) 46vw, 78vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative flex items-end gap-4 p-6 text-white">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/80">
                  <Image
                    src={c.avatar}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs uppercase tracking-wider text-white/70">
                    @{c.handle}
                  </p>
                  <p className="font-sans text-xl text-white">{c.name}</p>
                  <p className="mt-1 text-sm text-white/80">{c.bio}</p>
                </div>
              </div>
            </Link>
          ))}
          <div className="w-4 shrink-0 sm:w-6 lg:w-10" aria-hidden />
        </div>
      </div>
    </section>
  );
}
