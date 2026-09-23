import type { Metadata } from "next";
import { Caveat, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spellzee.in"),
  title: {
    default: "Spellzee",
    template: "%s | Spellzee",
  },
  description:
    "Cognitive Literacy Mapping and 1:1 live mentoring that help children read, write and speak with confidence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${instrument.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
