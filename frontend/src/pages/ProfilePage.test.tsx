import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { TOKEN_KEY } from "@/api/session";
import App from "@/App";
import AuthProvider from "@/auth/AuthProvider";
import { resetMockData } from "@/mocks/data";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

function renderProfile() {
  localStorage.setItem(TOKEN_KEY, "mock-token");
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={["/profile"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProfilePage", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterEach(() => {
    server.resetHandlers();
    resetMockData();
    localStorage.clear();
  });
  afterAll(() => server.close());

  test("shows the current user and their notes", async () => {
    renderProfile();

    expect(await screen.findByRole("heading", { name: "小哈用户" })).toBeInTheDocument();
    expect(
      (await screen.findAllByRole("article")).length,
    ).toBeGreaterThan(0);
  });

  test("shows an empty following list", async () => {
    renderProfile();
    await screen.findByRole("heading", { name: "小哈用户" });

    fireEvent.click(screen.getByRole("tab", { name: "关注" }));

    expect(await screen.findByText("还没有关注的人")).toBeInTheDocument();
  });

  test("shows the fans list", async () => {
    renderProfile();
    await screen.findByRole("heading", { name: "小哈用户" });

    fireEvent.click(screen.getByRole("tab", { name: "粉丝" }));

    expect(await screen.findByText("山野小鹿")).toBeInTheDocument();
  });

  test("logs out and returns to the login page", async () => {
    renderProfile();
    await screen.findByRole("heading", { name: "小哈用户" });

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    expect(
      await screen.findByRole("heading", { name: "登录" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
