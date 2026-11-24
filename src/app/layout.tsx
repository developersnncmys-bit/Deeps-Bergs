import type { Metadata } from "next";
import { Philosopher, Italiana, Great_Vibes, Raleway } from "next/font/google";
import { Preloader } from "@/components/layout/Preloader";
import "./globals.css";

// Body / UI — Philosopher (humanist/glyphic sans). 400 + 700 only.
const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

// Banner headings — Italiana (Italian display serif, single weight).
const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

// Reserved for the rent quote only — flowing script accent.
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

// Reserved for the AI strip headings ("Shop smarter", "Powered by AI…").
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Deeps & Bergs — Buy, Rent, Try On",
    template: "%s · Deeps & Bergs",
  },
  description:
    "Shop and rent across three fashion sections. AI try-on, smart search, curated looks and more.",
  metadataBase: new URL("https://deepsandbergs.example"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${philosopher.variable} ${italiana.variable} ${greatVibes.variable} ${raleway.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <Preloader />
        {children}
      </body>
    </html>
  );
}
