/**
 * All homepage copy and list data, verbatim from screens/homepage/Main.dc.html, one module
 * per page section. `{word}`-style placeholders are filled in by the component that owns the value.
 *
 * Components import their own section (`content/booking`), so a client component's bundle carries
 * only its section's copy. Code that needs several sections (routes, structured data, tests)
 * imports from here.
 */
export * from "./page";
export * from "./hero";
export * from "./clm";
export * from "./programs";
export * from "./oneOnOne";
export * from "./classroom";
export * from "./stories";
export * from "./educators";
export * from "./parentSupport";
export * from "./community";
export * from "./book";
export * from "./faq";
export * from "./booking";
export * from "./footer";
