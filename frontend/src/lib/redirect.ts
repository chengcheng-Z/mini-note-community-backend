export function safeRedirect(raw: string | null): string {
  if (!raw) {
    return "/";
  }

  if (
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.includes("\\") ||
    [...raw].some((char) => char.charCodeAt(0) < 32)
  ) {
    return "/";
  }

  return raw;
}
