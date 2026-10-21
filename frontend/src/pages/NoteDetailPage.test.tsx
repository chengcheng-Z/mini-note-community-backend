import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { delay, HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { TOKEN_KEY } from "@/api/session";
import App from "@/App";
import AuthProvider from "@/auth/AuthProvider";
import { resetMockData } from "@/mocks/data";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

function renderNote(path: string, loggedIn = true) {
  localStorage.clear();

  if (loggedIn) {
    localStorage.setItem(TOKEN_KEY, "mock-token");
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("NoteDetailPage", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterEach(() => {
    server.resetHandlers();
    resetMockData();
    localStorage.clear();
  });
  afterAll(() => server.close());

  test("renders note content and switches carousel images", async () => {
    renderNote("/note/1001");

    expect(
      await screen.findByRole("heading", {
        name: "周末去山里走了走，空气好到不想回城",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  test("renders a video player for video notes", async () => {
    renderNote("/note/1004");

    expect(await screen.findByTestId("detail-video")).toBeInTheDocument();
  });

  test("likes a note and updates the count", async () => {
    renderNote("/note/1001");

    const likeButton = await screen.findByRole("button", { name: "点赞" });
    fireEvent.click(likeButton);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "取消点赞" }),
      ).toHaveAttribute("aria-pressed", "true"),
    );
    expect(screen.getByTestId("like-count")).toHaveTextContent("121");
  });

  test("rolls back the like when the request fails", async () => {
    server.use(
      http.post("*/api/note/like", async () => {
        await delay(10);
        return HttpResponse.json({
          success: false,
          message: "点赞失败",
          errorCode: "MOCK-LIKE",
        });
      }),
    );
    renderNote("/note/1001");

    fireEvent.click(await screen.findByRole("button", { name: "点赞" }));

    expect(await screen.findByText("点赞失败")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "点赞" })).toHaveAttribute(
        "aria-pressed",
        "false",
      ),
    );
    expect(screen.getByTestId("like-count")).toHaveTextContent("120");
  });

  test("follows the note creator", async () => {
    renderNote("/note/1001");

    fireEvent.click(await screen.findByRole("button", { name: "关注" }));

    expect(
      await screen.findByRole("button", { name: "已关注" }),
    ).toBeInTheDocument();
  });

  test("asks unauthenticated users to log in before liking", async () => {
    renderNote("/note/1001", false);

    fireEvent.click(await screen.findByRole("button", { name: "点赞" }));

    expect(
      await screen.findByRole("heading", { name: "登录" }),
    ).toBeInTheDocument();
  });
});
