import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy without nonces (Next CSP guide, "Without Nonces"): nonces force
 * every page to render dynamically, and this site is fully static. Built from what the
 * site actually loads: every script, style, font, image, RSC fetch and the booking and
 * newsletter Server Action POSTs are same-origin; the leads and newsletter webhooks are
 * called server-side and never need a browser allowance. `'unsafe-inline'` on script-src
 * covers Next's inline RSC payload and bootstrap scripts; on style-src it covers React
 * `style` props. Nothing renders an inline event-handler attribute (`onclick="…"`; React
 * attaches listeners in JS), so script-src-attr 'none' blocks injected handlers such as
 * `<img onerror=…>` while the inline scripts keep working. No image is a data:/blob: URL,
 * so img-src stays 'self' (next/image `placeholder="blur"` would need data:). When adding a
 * third-party origin (analytics, the story videos' host, a booking widget), list it here in
 * the directive it needs (script-src, media-src, frame-src…): no wildcards.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Production only: in dev it would push http://<LAN-IP> asset requests to https and break them.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    // Nothing on the site uses these. The motion sensors (accelerometer, gyroscope,
    // magnetometer) are readable without a permission prompt on phones, and the rest would
    // show a child a device or screen-sharing prompt. Only names Chromium recognises: an
    // unknown one logs a console error.
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "browsing-topics=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
      "display-capture=()",
      "bluetooth=()",
      "hid=()",
      "serial=()",
      "midi=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Chrome's built-in XML viewer draws its expand/collapse arrows as data: SVGs. The
      // sitemap runs no scripts, so allowing data: images on it alone costs nothing.
      // Listed last so it overrides the site-wide CSP for this path only.
      {
        source: "/sitemap.xml",
        headers: [{ key: "Content-Security-Policy", value: csp.replace("img-src 'self'", "img-src 'self' data:") }],
      },
    ];
  },
  // Browsers and some crawlers request /favicon.ico directly; serve the generated app icon (src/app/icon.tsx).
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
};

export default nextConfig;
