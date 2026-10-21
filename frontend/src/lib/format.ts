export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  if (value < 10_000) {
    return String(Math.floor(value));
  }

  const wan = value / 10_000;
  const text =
    wan >= 100 ? String(Math.round(wan)) : wan.toFixed(1).replace(/\.0$/, "");

  return `${text}万`;
}

export function formatDuration(value?: number): string {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return "";
  }

  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
