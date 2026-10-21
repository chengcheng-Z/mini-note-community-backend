import { isMockEnabled } from "./config";

export async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV || !isMockEnabled()) {
    return;
  }

  const { worker } = await import("./browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
}
