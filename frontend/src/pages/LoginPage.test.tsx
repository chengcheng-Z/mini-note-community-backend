import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { TOKEN_KEY } from "@/api/session";
import App from "@/App";
import AuthProvider from "@/auth/AuthProvider";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function renderLogin(initialPath = "/login") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[initialPath]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("login page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("rejects an invalid phone number without calling the api", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderLogin();

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    expect(screen.getByText("请输入正确的手机号")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("sends the code and starts the 180 second countdown", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: null }));
    vi.stubGlobal("fetch", fetchMock);
    renderLogin();

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13800138000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    expect(await screen.findByRole("button", { name: /180/ })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/verification/code/send",
      expect.objectContaining({
        body: JSON.stringify({ phone: "13800138000" }),
      }),
    );
  });

  test("logs in and returns to the redirect target", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ success: true, data: "token" })),
    );
    renderLogin("/login?redirect=%2Fprofile");

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13800138000" },
    });
    fireEvent.change(screen.getByLabelText("验证码"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(
      await screen.findByRole("heading", { name: "我的" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("token");
  });

  test("shows the backend error message when login fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: false,
          message: "验证码错误",
          errorCode: "AUTH-20001",
        }),
      ),
    );
    renderLogin();

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13800138000" },
    });
    fireEvent.change(screen.getByLabelText("验证码"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByText("验证码错误")).toBeInTheDocument();
  });
});
