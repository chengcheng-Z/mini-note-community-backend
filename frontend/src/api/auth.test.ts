import { beforeEach, describe, expect, test, vi } from "vitest";
import { loginWithCode, logout, sendVerificationCode } from "./auth";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("auth api", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("sends a verification code with the phone number", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: null }));
    vi.stubGlobal("fetch", fetchMock);

    await sendVerificationCode("13800138000");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/verification/code/send",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone: "13800138000" }),
      }),
    );
  });

  test("logs in with phone and verification code", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: "token-abc" }));
    vi.stubGlobal("fetch", fetchMock);

    const token = await loginWithCode("13800138000", "123456");

    expect(token).toBe("token-abc");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        body: JSON.stringify({
          phone: "13800138000",
          type: 1,
          code: "123456",
        }),
      }),
    );
  });

  test("logs out through the auth endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: null }));
    vi.stubGlobal("fetch", fetchMock);

    await logout();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
