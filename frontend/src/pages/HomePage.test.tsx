import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import App from "@/App";
import AuthProvider from "@/auth/AuthProvider";
import { resetMockData } from "@/mocks/data";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={["/"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("HomePage", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterEach(() => {
    server.resetHandlers();
    resetMockData();
    localStorage.clear();
  });
  afterAll(() => server.close());

  test("renders the feed cards from the api", async () => {
    renderHome();

    expect(
      await screen.findByText("周末去山里走了走，空气好到不想回城"),
    ).toBeInTheDocument();
    expect(await screen.findAllByRole("article")).toHaveLength(10);
  });

  test("asks unauthenticated users to log in when opening the follow tab", async () => {
    renderHome();

    fireEvent.click(screen.getByRole("tab", { name: "关注" }));

    expect(
      await screen.findByRole("heading", { name: "登录" }),
    ).toBeInTheDocument();
  });

  test("shows an error state with retry when the feed fails", async () => {
    server.use(
      http.post("*/api/note/feed", () =>
        HttpResponse.json({
          success: false,
          message: "内容加载失败",
          errorCode: "MOCK-FEED",
        }),
      ),
    );
    renderHome();

    expect(await screen.findByText("内容加载失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重试" })).toBeInTheDocument();
  });
});
