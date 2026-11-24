import { ChapterPromise } from "@/components/home/ChapterPromise";
import { ChapterCategories } from "@/components/home/ChapterCategories";
import { ChapterHow } from "@/components/home/ChapterHow";
import { ChapterRent } from "@/components/home/ChapterRent";
import { ChapterModeSplit } from "@/components/home/ChapterModeSplit";
import { NewArrivalsCarousel } from "@/components/home/NewArrivalsCarousel";
import { ChapterTryOn } from "@/components/home/ChapterTryOn";
import { AiToolkitStrip } from "@/components/home/AiToolkitStrip";
import { ChapterVideos } from "@/components/home/ChapterVideos";
import { ChapterCreatorProgram } from "@/components/home/ChapterCreatorProgram";
import { ChapterStory } from "@/components/home/ChapterStory";
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
      {/* Categories is NOT wrapped in InView — InView uses translate-y which
          breaks position: sticky inside. Categories is sticky so ChapterRent
          can slide up over it. */}
      <ChapterCategories />
      <InView>
        <ChapterRent />
      </InView>
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
      <InView>
        <ChapterVideos />
      </InView>
      <InView>
        <ChapterCreatorProgram />
      </InView>
      <InView>
        <ChapterHow />
      </InView>
    </>
  );
}
