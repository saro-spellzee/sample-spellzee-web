import type { Metadata } from "next";
import { meta } from "@/features/homepage/content";
import { BookSection } from "@/features/homepage/sections/BookSection";
import { ClassroomSection } from "@/features/homepage/sections/ClassroomSection";
import { ClmSection } from "@/features/homepage/sections/ClmSection";
import { CommunitySection } from "@/features/homepage/sections/CommunitySection";
import { CtaSection } from "@/features/homepage/sections/CtaSection";
import { EducatorsSection } from "@/features/homepage/sections/EducatorsSection";
import { FaqSection } from "@/features/homepage/sections/FaqSection";
import { HeroSection } from "@/features/homepage/sections/HeroSection";
import { HomeFooter } from "@/features/homepage/sections/HomeFooter";
import { HomeHeader } from "@/features/homepage/sections/HomeHeader";
import { OneOnOneSection } from "@/features/homepage/sections/OneOnOneSection";
import { ParentSupportSection } from "@/features/homepage/sections/ParentSupportSection";
import { ProgramsSection } from "@/features/homepage/sections/ProgramsSection";
import { StoriesSection } from "@/features/homepage/sections/StoriesSection";

export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Spellzee",
    title: meta.title,
    description: meta.description,
    images: [{ url: "/images/homepage/hero-child.jpg", width: 1672, height: 941, alt: meta.ogImageAlt }],
  },
};

export default function HomePage() {
  return (
    <div className="min-w-90 overflow-x-clip bg-cream">
      <HomeHeader />
      <main>
        <HeroSection />
        <ClmSection />
        <ProgramsSection />
        <OneOnOneSection />
        <ClassroomSection />
        <StoriesSection />
        <EducatorsSection />
        <ParentSupportSection />
        <CommunitySection />
        <BookSection />
        <FaqSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}
