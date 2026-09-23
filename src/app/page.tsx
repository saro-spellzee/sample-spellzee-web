import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { meta } from "@/features/homepage/content";
import { homepageStructuredData } from "@/features/homepage/structured-data";
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

// Share image: app/opengraph-image.tsx + twitter-image.tsx (branded 1200×630 card).
export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: meta.title,
    description: meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
};

export default function HomePage() {
  return (
    <div className="min-w-90 overflow-x-clip bg-cream">
      <JsonLd data={homepageStructuredData()} />
      <HomeHeader />
      <main id="main" tabIndex={-1} className="outline-none">
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
