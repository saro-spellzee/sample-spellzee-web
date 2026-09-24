import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest doesn't run Testing Library's auto-cleanup without `globals: true`.
afterEach(() => cleanup());
