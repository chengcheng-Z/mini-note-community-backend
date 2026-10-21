import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  ApiError,
  NetworkError,
  UnauthorizedError,
  post,
  upload,
} from "./client";
import { TOKEN_KEY } from "./session";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("api client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("posts JSON to /api with the bearer token", async () => {
    localStorage.setItem(TOKEN_KEY, "token-123");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: { id: 1 } }));
    vi.stubGlobal("fetch", fetchMock);

    const data = await post<{ id: number }>("/note/detail", { id: 1 });

    expect(data).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/note/detail",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ id: 1 }),
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  test("omits the Authorization header when there is no token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: null }));
    vi.stubGlobal("fetch", fetchMock);

    await post("/user/me");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  test("throws ApiError with backend message when success is false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: false,
          message: "手机号已注册",
          errorCode: "A0001",
        }),
      ),
    );

    await expect(post("/user/register", {})).rejects.toMatchObject({
      name: "ApiError",
      message: "手机号已注册",
      errorCode: "A0001",
    });
  });

  test("clears the token and emits unauthorized on 401", async () => {
    localStorage.setItem(TOKEN_KEY, "expired");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ success: false, message: "未登录" }, 401),
      ),
    );
    const onUnauthorized = vi.fn();
    window.addEventListener("xh:unauthorized", onUnauthorized);

    await expect(post("/user/me")).rejects.toBeInstanceOf(UnauthorizedError);

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener("xh:unauthorized", onUnauthorized);
  });

  test("wraps network failures in NetworkError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(post("/note/feed", {})).rejects.toBeInstanceOf(NetworkError);
  });

  test("uploads FormData without forcing a JSON content type", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ success: true, data: "https://cdn/x.png" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const url = await upload<string>("/file/upload", new FormData());

    expect(url).toBe("https://cdn/x.png");
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).not.toHaveProperty("Content-Type");
  });

  test("exposes ApiError as an Error subclass", () => {
    expect(new ApiError("boom")).toBeInstanceOf(Error);
  });
});
