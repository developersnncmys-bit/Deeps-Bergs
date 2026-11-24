import { ChapterPromise } from "@/components/home/ChapterPromise";
import { ChapterCategories } from "@/components/home/ChapterCategories";
import { ChapterHow } from "@/components/home/ChapterHow";
import { ChapterRent } from "@/components/home/ChapterRent";
import { ChapterModeSplit } from "@/components/home/ChapterModeSplit";
import { NewArrivalsCarousel } from "@/components/home/NewArrivalsCarousel";
import { ChapterTryOn } from "@/components/home/ChapterTryOn";
import { AiToolkitStrip } from "@/components/home/AiToolkitStrip";
import { ChapterAiDemo } from "@/components/home/ChapterAiDemo";
import { ChapterOutfitShowcase } from "@/components/home/ChapterOutfitShowcase";
import { ChapterVideos } from "@/components/home/ChapterVideos";
import { ChapterCreatorProgram } from "@/components/home/ChapterCreatorProgram";
import { ChapterStory } from "@/components/home/ChapterStory";
import { ChapterMembership } from "@/components/home/ChapterMembership";
import { AiFeaturesStrip } from "@/components/home/AiFeaturesStrip";
import { SectionIndex, type ChapterEntry } from "@/components/home/SectionIndex";
import { InView } from "@/components/home/InView";

const chapters: ChapterEntry[] = [
  { id: "chapter-promise", label: "Promise", tone: "dark" },
  { id: "chapter-categories", label: "Categories", tone: "light" },
  { id: "chapter-rent", label: "Rent", tone: "dark" },
  { id: "chapter-tryon", label: "Try-on", tone: "light" },
  { id: "chapter-creators", label: "Creators", tone: "light" },
  { id: "chapter-ready", label: "Ready", tone: "dark" },
  { id: "chapter-how", label: "How", tone: "dark" },
];

export default function HomePage() {
  return (
    <>
      {/* <SectionIndex chapters={chapters} /> */}

      <ChapterPromise />
      {/* Chapters below used to be wrapped in <div className="relative z-10 bg-surface">
          so they would slide over the sticky hero. Removed for normal scroll flow. */}
      <InView>
        <AiFeaturesStrip />
      </InView>
      {/* Not wrapped in InView — InView uses translate which breaks position: sticky inside. */}
      <ChapterModeSplit />
      {/* Scope the Categories-sticky / Rent-slide-over effect to this
          wrapper only. Without a bounded containing block, the sticky
          Categories would stay active for the entire page scroll (since
          <main> wraps everything) and bleed into later sections.
          Inside: Categories pins at top, Rent slides up over it. The moment
          the user scrolls past Rent, this wrapper's bottom crosses the
          sticky offset and Categories unsticks — leaving every other
          section untouched. */}
      <div className="relative">
        <ChapterCategories />
        <ChapterRent />
      </div>
      <InView>
        <NewArrivalsCarousel />
      </InView>
      {/* Pinned scroll story — intentionally NOT wrapped in InView,
          because InView uses translate which breaks position: sticky inside. */}
      <ChapterStory />
      {/* Try-on chapter main panel — temporarily hidden; the toolkit strip (with typewriter heading) stays
      <InView>
        <ChapterTryOn />
      </InView>
      */}
      <InView>
        <AiToolkitStrip />
      </InView>
      {/* AI demo videos — temporarily hidden
      <InView>
        <ChapterAiDemo />
      </InView>
      */}
      <InView>
        <ChapterVideos />
      </InView>
      <InView>
        <ChapterOutfitShowcase />
      </InView>
      <InView>
        <ChapterCreatorProgram />
      </InView>
      <InView>
        <ChapterMembership />
      </InView>
      <InView>
        <ChapterHow />
      </InView>
    </>
  );
}
