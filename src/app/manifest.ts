import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Cognitive Literacy Mapping`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [
      { src: "/icon", sizes: "48x48", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
