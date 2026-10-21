import { beforeEach, describe, expect, test, vi } from "vitest";
import { TOKEN_KEY } from "./session";
import { uploadFile } from "./files";

type ProgressHandler = (event: {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}) => void;

const uploadListeners: Record<string, ProgressHandler> = {};
const listeners: Record<string, () => void> = {};
const headers: Record<string, string> = {};
let payload = { success: true, data: "https://cdn/uploaded.png" };
let status = 200;

class FakeXhr {
  status = 200;
  responseText = "";

  upload = {
    addEventListener: (type: string, handler: ProgressHandler) => {
      uploadListeners[type] = handler;
    },
  };

  open() {}

  setRequestHeader(key: string, value: string) {
    headers[key] = value;
  }

  addEventListener(type: string, handler: () => void) {
    listeners[type] = handler;
  }

  send() {
    uploadListeners.progress?.({
      lengthComputable: true,
      loaded: 50,
      total: 100,
    });
    this.status = status;
    this.responseText = JSON.stringify(payload);
    listeners.load?.();
  }
}

describe("uploadFile", () => {
  beforeEach(() => {
    localStorage.clear();
    for (const key of Object.keys(headers)) {
      delete headers[key];
    }
    payload = { success: true, data: "https://cdn/uploaded.png" };
    status = 200;
    vi.unstubAllGlobals();
    vi.stubGlobal("XMLHttpRequest", FakeXhr);
  });

  test("uploads with the bearer token and reports progress", async () => {
    localStorage.setItem(TOKEN_KEY, "token-1");
    const onProgress = vi.fn();
    const file = new File(["hello"], "a.png", { type: "image/png" });

    const url = await uploadFile(file, onProgress);

    expect(url).toBe("https://cdn/uploaded.png");
    expect(headers.Authorization).toBe("Bearer token-1");
    expect(onProgress).toHaveBeenCalledWith(50);
  });

  test("rejects when the server returns success false", async () => {
    payload = { success: false, data: "" };
    const file = new File(["hello"], "a.png", { type: "image/png" });

    await expect(uploadFile(file)).rejects.toMatchObject({
      name: "ApiError",
    });
  });

  test("rejects on network errors", async () => {
    vi.stubGlobal(
      "XMLHttpRequest",
      class extends FakeXhr {
        send() {
          listeners.error?.();
        }
      },
    );

    await expect(
      uploadFile(new File(["hello"], "a.png", { type: "image/png" })),
    ).rejects.toMatchObject({ name: "ApiError" });
  });
});
