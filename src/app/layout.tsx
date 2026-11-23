import type { Metadata } from "next";
import { Philosopher, Anton, Raleway, Great_Vibes, Italianno } from "next/font/google";
import { Preloader } from "@/components/layout/Preloader";
import "./globals.css";

// Body / UI — Philosopher (humanist/glyphic sans). 400 + 700 only.
const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

// Display — Anton, used only by the navbar brand name (single weight, very heavy by design).
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

// Nav page links — Raleway (full weight range).
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Section accents — Great Vibes (flowing script).
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

// Banner headings — Italianno (calligraphy script).
const italianno = Italianno({
  variable: "--font-italianno",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
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
      className={`${philosopher.variable} ${anton.variable} ${raleway.variable} ${greatVibes.variable} ${italianno.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <Preloader />
        {children}
      </body>
    </html>
  );
}
