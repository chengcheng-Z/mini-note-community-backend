import { describe, expect, test } from "vitest";
import { safeRedirect } from "./redirect";

describe("safeRedirect", () => {
  test("keeps internal paths", () => {
    expect(safeRedirect("/profile?tab=notes")).toBe("/profile?tab=notes");
    expect(safeRedirect("/")).toBe("/");
  });

  test("rejects external and malformed targets", () => {
    expect(safeRedirect(null)).toBe("/");
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect("/\\evil.com")).toBe("/");
    expect(safeRedirect("/\tevil")).toBe("/");
  });
});
