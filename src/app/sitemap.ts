import type { MetadataRoute } from "next";
import { hero } from "@/features/homepage/content";
import { absoluteUrl } from "@/lib/site";

/**
 * Only routes that actually exist. When a new screen is converted
 * (e.g. /phonics), add it here so it is indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl(hero.image.src)],
    },
  ];
}
