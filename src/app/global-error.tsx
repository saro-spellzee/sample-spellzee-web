"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { globalError } from "@/features/errors/content";
import { site } from "@/lib/site";

export type GlobalErrorProps = {
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the root (Next 16; preferred over `reset`). */
  retry: () => void;
};

// Replaces the root layout, so globals.css, fonts and tokens are NOT loaded here.
// Everything is inline, uses system fonts and loads nothing external, which keeps it
// inside the strict CSP (style-src 'unsafe-inline'; no data: images, no web fonts).
const ink = "#0e1a3a";
const inkSoft = "#4b5575";
const styles = `
  .ge-body { margin: 0; min-height: 100svh; display: flex; align-items: center; justify-content: center;
    background: ${site.themeColor}; color: ${ink}; padding: 24px 16px; box-sizing: border-box;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .ge-main { max-width: 560px; text-align: center; outline: none; }
  .ge-brand { margin: 0 0 32px; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: ${site.brandColor}; }
  .ge-title { margin: 0; font-size: clamp(30px, 6vw, 44px); line-height: 1.1; letter-spacing: -0.03em; font-weight: 800; }
  .ge-text { margin: 16px 0 0; font-size: 17px; line-height: 1.65; color: ${inkSoft}; }
  .ge-actions { margin-top: 32px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .ge-btn { display: inline-flex; align-items: center; min-height: 48px; padding: 0 24px; border-radius: 999px;
    font: inherit; font-size: 15.5px; font-weight: 700; text-decoration: none; cursor: pointer; }
  .ge-primary { background: ${site.brandColor}; color: #fff; border: 1px solid ${site.brandColor}; }
  .ge-primary:hover { background: #0f45ae; }
  .ge-ghost { background: #fff; color: ${ink}; border: 1px solid #dce1ec; }
  .ge-ghost:hover { border-color: ${site.brandColor}; color: ${site.brandColor}; }
  .ge-btn:focus-visible { outline: 3px solid rgb(21 87 214 / 0.35); outline-offset: 3px; }
`;

/** Last-resort screen when the root layout itself fails to render. */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    // TODO(product): forward to an error-monitoring service once one is chosen.
    console.error(error);
  }, [error]);

  return (
    <html lang={site.language}>
      <head>
        <title>{globalError.title}</title>
        <meta name="robots" content="noindex" />
        <style>{styles}</style>
      </head>
      <body className="ge-body">
        <main className="ge-main" aria-labelledby="ge-title">
          <p className="ge-brand">{globalError.brand}</p>
          <h1 id="ge-title" className="ge-title">
            {globalError.heading}
          </h1>
          <p className="ge-text">{globalError.body}</p>
          <div className="ge-actions">
            <button type="button" className="ge-btn ge-primary" onClick={() => retry()}>
              {globalError.retry}
            </button>
            {/* Plain <a>s: a full reload is the most reliable recovery once the root has failed. */}
            <a href={globalError.home.href} className="ge-btn ge-ghost">
              {globalError.home.label}
            </a>
            <a href={globalError.cta.href} className="ge-btn ge-ghost">
              {globalError.cta.label}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
