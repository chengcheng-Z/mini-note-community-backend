import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { TOKEN_KEY } from "@/api/session";
import AuthProvider from "./AuthProvider";
import RequireAuth from "./RequireAuth";
import { useAuth } from "./useAuth";

function LoginStub() {
  const { isLoggedIn, token, login, logout } = useAuth();
  const location = useLocation();

  return (
    <div>
      <div>登录页:{location.search}</div>
      <span data-testid="state">{isLoggedIn ? `in:${token}` : "out"}</span>
      <button onClick={() => login("new-token")}>模拟登录</button>
      <button onClick={() => void logout()}>退出</button>
    </div>
  );
}

function Probe() {
  const { token } = useAuth();
  return <span data-testid="state">in:{token}</span>;
}

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginStub />} />
          <Route
            path="/probe"
            element={
              <RequireAuth>
                <Probe />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("auth state", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("redirects unauthenticated users to login with a redirect param", () => {
    renderAt("/probe");

    expect(screen.getByText(/登录页:/)).toHaveTextContent(
      "redirect=%2Fprobe",
    );
  });

  test("persists the token after login", () => {
    renderAt("/login");

    fireEvent.click(screen.getByRole("button", { name: "模拟登录" }));

    expect(screen.getByTestId("state")).toHaveTextContent("in:new-token");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("new-token");
  });

  test("restores the token from storage on mount", () => {
    localStorage.setItem(TOKEN_KEY, "persisted");

    renderAt("/probe");

    expect(screen.getByTestId("state")).toHaveTextContent("in:persisted");
  });

  test("clears state and redirects on unauthorized events", () => {
    localStorage.setItem(TOKEN_KEY, "expired");
    renderAt("/probe");

    act(() => {
      window.dispatchEvent(new Event("xh:unauthorized"));
    });

    expect(screen.getByText(/登录页:/)).toHaveTextContent(
      "redirect=%2Fprobe",
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  test("calls the logout api and clears the token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: null }));
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem(TOKEN_KEY, "persisted");
    renderAt("/login");

    fireEvent.click(screen.getByRole("button", { name: "退出" }));

    expect(await screen.findByTestId("state")).toHaveTextContent("out");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
