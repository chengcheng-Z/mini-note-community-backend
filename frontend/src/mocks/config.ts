export function isMockEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true";
}
