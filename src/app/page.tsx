import type { Metadata } from "next";
import { WidgetBoundary } from "@/components/errors/WidgetBoundary";
import { JsonLd } from "@/components/seo/JsonLd";
import { meta } from "@/features/homepage/content";
import { site } from "@/lib/site";
import { homepageStructuredData } from "@/features/homepage/structured-data";
import { BookingDialog } from "@/features/homepage/components/booking/BookingDialog";
import { MotionToggle } from "@/features/homepage/components/MotionToggle";
import { BookSection } from "@/features/homepage/sections/BookSection";
import { ClassroomSection } from "@/features/homepage/sections/ClassroomSection";
import { ClmSection } from "@/features/homepage/sections/ClmSection";
import { CommunitySection } from "@/features/homepage/sections/CommunitySection";
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
  // A route's openGraph replaces the layout's wholesale, so repeat siteName/locale here.
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
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
    // No min-width: the export's 360px canvas minimum would scroll sideways on 320px screens (WCAG 1.4.10).
    <div className="overflow-x-clip bg-cream">
      <JsonLd data={homepageStructuredData()} />
      <HomeHeader />
      <WidgetBoundary name="Motion toggle">
        <MotionToggle />
      </WidgetBoundary>
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
      </main>
      <HomeFooter />
      {/* If the dialog fails, the booking CTAs go to the #book section instead. */}
      <WidgetBoundary name="Booking dialog">
        <BookingDialog />
      </WidgetBoundary>
    </div>
  );
}
