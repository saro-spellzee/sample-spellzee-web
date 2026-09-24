// Vitest stand-in for the `server-only` marker. Next.js handles the real import at build
// time (it errors if a Client Component pulls the module in); tests run outside Next.
export {};
