import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TOKEN_KEY } from "@/api/session";
import { uploadFile } from "@/api/files";
import { publishNote } from "@/api/notes";
import App from "@/App";
import AuthProvider from "@/auth/AuthProvider";
import { resetMockData } from "@/mocks/data";
import { handlers } from "@/mocks/handlers";

vi.mock("@/api/files", () => ({ uploadFile: vi.fn() }));
vi.mock("@/api/notes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/notes")>();
  return { ...actual, publishNote: vi.fn() };
});

const server = setupServer(...handlers);
const uploadMock = vi.mocked(uploadFile);
const publishMock = vi.mocked(publishNote);

function renderPublish() {
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
        initialEntries={["/publish"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("PublishPage", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  beforeEach(() => {
    uploadMock.mockReset();
    publishMock.mockReset();
    publishMock.mockResolvedValue(null);
  });
  afterEach(() => {
    server.resetHandlers();
    resetMockData();
    localStorage.clear();
  });
  afterAll(() => server.close());

  test("rejects unsupported file types", async () => {
    renderPublish();
    const file = new File(["hello"], "a.txt", { type: "text/plain" });

    fireEvent.change(screen.getByLabelText("选择图片"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByText("仅支持 JPG/PNG/WebP/GIF 图片"),
    ).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  test("uploads an image and publishes an image note", async () => {
    uploadMock.mockResolvedValue("https://cdn/uploaded.png");
    renderPublish();
    const file = new File(["hello"], "a.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText("选择图片"), {
      target: { files: [file] },
    });
    expect(await screen.findByText("1 / 9")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector('[data-status="done"]')).not.toBeNull(),
    );

    fireEvent.change(screen.getByLabelText("标题"), {
      target: { value: "我的第一条笔记" },
    });
    fireEvent.change(screen.getByLabelText("正文"), {
      target: { value: "这是正文内容" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发布" }));

    expect(
      await screen.findByRole("heading", { name: "首页" }),
    ).toBeInTheDocument();
    expect(publishMock).toHaveBeenCalledWith({
      type: 0,
      imgUris: ["https://cdn/uploaded.png"],
      title: "我的第一条笔记",
      content: "这是正文内容",
    });
  });

  test("publishes a video note", async () => {
    uploadMock.mockResolvedValue("https://cdn/uploaded.mp4");
    renderPublish();
    const file = new File(["video"], "a.mp4", { type: "video/mp4" });

    fireEvent.click(screen.getByRole("button", { name: "视频" }));
    fireEvent.change(screen.getByLabelText("选择视频"), {
      target: { files: [file] },
    });
    expect(await screen.findByText("视频已选择")).toBeInTheDocument();
    expect(await screen.findByText("上传完成")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "发布" }));

    expect(
      await screen.findByRole("heading", { name: "首页" }),
    ).toBeInTheDocument();
    expect(publishMock).toHaveBeenCalledWith({
      type: 1,
      videoUri: "https://cdn/uploaded.mp4",
      title: "",
      content: "",
    });
  });

  test("shows an upload error", async () => {
    uploadMock.mockRejectedValue(new Error("上传失败"));
    renderPublish();

    fireEvent.change(screen.getByLabelText("选择图片"), {
      target: {
        files: [new File(["hello"], "a.png", { type: "image/png" })],
      },
    });

    expect(await screen.findByText(/上传失败/)).toBeInTheDocument();
  });
});
