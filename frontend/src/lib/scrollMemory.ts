const SCROLL_KEY = "xh:home-scroll";

export function saveHomeScroll(y: number): void {
  if (!Number.isFinite(y) || y < 0) {
    return;
  }

  try {
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(y)));
  } catch {
    // 忽略隐私模式下的存储异常
  }
}

export function readHomeScroll(): number | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);

    if (!raw) {
      return null;
    }

    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

export function clearHomeScroll(): void {
  try {
    sessionStorage.removeItem(SCROLL_KEY);
  } catch {
    // 忽略隐私模式下的存储异常
  }
}
