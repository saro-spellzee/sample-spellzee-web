import type { MetadataRoute } from "next";
import { hero } from "@/features/homepage/content";
import { lastChanged } from "@/lib/last-changed";
import { absoluteUrl } from "@/lib/site";

/**
 * Only routes that actually exist. When a new screen is converted
 * (e.g. /phonics), add it here so it is indexed, with its own content paths.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      // The page's copy and images, not the build time: see lastChanged.
      lastModified: lastChanged("src/features/homepage/content", "public/images/homepage"),
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl(hero.image.src)],
    },
  ];
}
