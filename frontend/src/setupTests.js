import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest doesn't expose globals here, so React Testing Library can't clean up after itself.
afterEach(() => cleanup());
