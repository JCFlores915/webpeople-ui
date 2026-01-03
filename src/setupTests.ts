import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

class ResizeObserver {
  // Minimal stub to satisfy Radix usage in tests
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error jsdom global augmentation for tests
global.ResizeObserver = ResizeObserver;

afterEach(() => {
  cleanup();
});
