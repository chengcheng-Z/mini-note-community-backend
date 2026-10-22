import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { resetMockData } from "@/mocks/data";
import { handlers } from "@/mocks/handlers";
import { useInfiniteFeed } from "./useInfiniteFeed";

const server = setupServer(...handlers);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useInfiniteFeed", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => {
    server.resetHandlers();
    resetMockData();
  });
  afterAll(() => server.close());

  test("loads the first page and appends the next page", async () => {
    const { result } = renderHook(() => useInfiniteFeed("recommend"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].data).toHaveLength(10);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() =>
      expect(result.current.data?.pages).toHaveLength(2),
    );
    expect(result.current.data?.pages[1].pageNo).toBe(2);
  });

  test("filters by note type", async () => {
    const { result } = renderHook(() => useInfiniteFeed("recommend", 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      result.current.data?.pages[0].data.every((note) => note.type === 1),
    ).toBe(true);
  });
});
