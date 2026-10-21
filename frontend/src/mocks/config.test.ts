import { afterEach, describe, expect, test, vi } from "vitest";
import { isMockEnabled } from "./config";

describe("mock config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("is disabled for empty or explicit false values", () => {
    vi.stubEnv("VITE_USE_MOCK", "");
    expect(isMockEnabled()).toBe(false);

    vi.stubEnv("VITE_USE_MOCK", "false");
    expect(isMockEnabled()).toBe(false);
  });

  test("is enabled only when VITE_USE_MOCK is true", () => {
    vi.stubEnv("VITE_USE_MOCK", "true");
    expect(isMockEnabled()).toBe(true);

    vi.stubEnv("VITE_USE_MOCK", "false");
    expect(isMockEnabled()).toBe(false);
  });
});
