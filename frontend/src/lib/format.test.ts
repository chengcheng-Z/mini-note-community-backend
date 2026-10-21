import { describe, expect, test } from "vitest";
import { formatCount, formatDuration } from "./format";

describe("formatCount", () => {
  test("keeps numbers below ten thousand as-is", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(9999)).toBe("9999");
  });

  test("uses 万 for ten thousand and above", () => {
    expect(formatCount(10000)).toBe("1万");
    expect(formatCount(12000)).toBe("1.2万");
    expect(formatCount(10500)).toBe("1.1万");
  });
});

describe("formatDuration", () => {
  test("formats seconds as mm:ss", () => {
    expect(formatDuration(5)).toBe("00:05");
    expect(formatDuration(65)).toBe("01:05");
    expect(formatDuration(600)).toBe("10:00");
  });

  test("returns an empty string when duration is missing", () => {
    expect(formatDuration(undefined)).toBe("");
  });
});
