import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import App from "./App";
import AuthProvider from "./auth/AuthProvider";

function renderApp(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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

describe("App routes", () => {
  test("renders the home page at /", () => {
    renderApp("/");

    expect(screen.getByRole("heading", { name: "首页" })).toBeInTheDocument();
  });

  test("renders the login page at /login", () => {
    renderApp("/login");

    expect(screen.getByRole("heading", { name: "登录" })).toBeInTheDocument();
  });
});
