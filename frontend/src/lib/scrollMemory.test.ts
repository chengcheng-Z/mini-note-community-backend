import { describe, expect, test } from "vitest";
import { clearHomeScroll, readHomeScroll, saveHomeScroll } from "./scrollMemory";

describe("scroll memory", () => {
  test("saves and reads the home scroll position", () => {
    sessionStorage.clear();
    saveHomeScroll(1234);

    expect(readHomeScroll()).toBe(1234);

    clearHomeScroll();
    expect(readHomeScroll()).toBeNull();
  });

  test("ignores invalid values", () => {
    sessionStorage.setItem("xh:home-scroll", "abc");
    expect(readHomeScroll()).toBeNull();

    sessionStorage.setItem("xh:home-scroll", "-5");
    expect(readHomeScroll()).toBeNull();
  });
});
