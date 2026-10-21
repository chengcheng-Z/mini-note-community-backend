import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { resetMockData } from "./data";
import { handlers } from "./handlers";

const server = setupServer(...handlers);

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`http://localhost/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return (await response.json()) as T;
}

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type FeedPayload = Envelope<
  Array<{ id: number; type: 0 | 1; title: string; liked: boolean }>
> & {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
};

type DetailPayload = Envelope<{
  id: number;
  content: string;
  creatorId: number;
  liked: boolean;
  likeCount: number;
}>;

describe("mock handlers", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => {
    server.resetHandlers();
    resetMockData();
  });
  afterAll(() => server.close());

  test("returns the first feed page with pagination metadata", async () => {
    const payload = await api<FeedPayload>("/note/feed", {
      pageNo: 1,
      pageSize: 10,
      tab: "recommend",
    });

    expect(payload.success).toBe(true);
    expect(payload.data).toHaveLength(10);
    expect(payload.pageNo).toBe(1);
    expect(payload.totalCount).toBeGreaterThan(10);
    expect(payload.totalPage).toBeGreaterThan(1);
  });

  test("returns different notes on the second page", async () => {
    const first = await api<FeedPayload>("/note/feed", {
      pageNo: 1,
      pageSize: 10,
      tab: "recommend",
    });
    const second = await api<FeedPayload>("/note/feed", {
      pageNo: 2,
      pageSize: 10,
      tab: "recommend",
    });

    expect(second.data[0].id).not.toBe(first.data[0].id);
  });

  test("returns note detail that matches the feed contract", async () => {
    const feed = await api<FeedPayload>("/note/feed", {
      pageNo: 1,
      pageSize: 10,
      tab: "recommend",
    });
    const noteId = feed.data[0].id;

    const detail = await api<DetailPayload>("/note/detail", { id: noteId });

    expect(detail.data.id).toBe(noteId);
    expect(detail.data.content.length).toBeGreaterThan(0);
    expect(detail.data.creatorId).toBeGreaterThan(0);
  });

  test("toggles like state and count", async () => {
    const feed = await api<FeedPayload>("/note/feed", {
      pageNo: 1,
      pageSize: 10,
      tab: "recommend",
    });
    const note = feed.data[0];
    const before = await api<DetailPayload>("/note/detail", { id: note.id });

    await api("/note/like", { noteId: note.id });
    const liked = await api<DetailPayload>("/note/detail", { id: note.id });
    expect(liked.data.liked).toBe(true);
    expect(liked.data.likeCount).toBe(before.data.likeCount + 1);

    await api("/note/unlike", { noteId: note.id });
    const unliked = await api<DetailPayload>("/note/detail", { id: note.id });
    expect(unliked.data.liked).toBe(false);
    expect(unliked.data.likeCount).toBe(before.data.likeCount);
  });

  test("logs in with the demo verification code and rejects others", async () => {
    const ok = await api<Envelope<string>>("/auth/login", {
      phone: "13800138000",
      type: 1,
      code: "123456",
    });
    expect(ok.success).toBe(true);
    expect(ok.data).toBeTypeOf("string");

    const bad = await api<Envelope<string>>("/auth/login", {
      phone: "13800138000",
      type: 1,
      code: "000000",
    });
    expect(bad.success).toBe(false);
    expect(bad.message).toBe("验证码错误");
  });

  test("returns the current mock user", async () => {
    const me = await api<Envelope<{ id: number; nickName: string }>>(
      "/user/me",
    );

    expect(me.data.id).toBeGreaterThan(0);
    expect(me.data.nickName.length).toBeGreaterThan(0);
  });
});
