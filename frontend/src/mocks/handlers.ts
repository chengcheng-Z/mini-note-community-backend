import { HttpResponse, http } from "msw";
import type { FeedTab, PublishNoteRequest } from "@/api/types";
import {
  getLikedStatus,
  getMe,
  getNoteDetail,
  getUser,
  isFollowing,
  listFans,
  listFeed,
  listFollowing,
  publishNote,
  setFollowing,
  setLiked,
} from "./data";

const ok = (data: unknown) => HttpResponse.json({ success: true, data });

const fail = (message: string, errorCode = "MOCK-ERROR") =>
  HttpResponse.json({ success: false, message, errorCode });

const page = (result: {
  items: unknown[];
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}) =>
  HttpResponse.json({
    success: true,
    data: result.items,
    pageNo: result.pageNo,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPage: result.totalPage,
  });

const PHONE_PATTERN = /^1[3-9]\d{9}$/;

export const handlers = [
  http.post("*/api/auth/verification/code/send", async ({ request }) => {
    const body = (await request.json()) as { phone?: string };

    if (!body.phone || !PHONE_PATTERN.test(body.phone)) {
      return fail("请输入正确的手机号", "MOCK-PHONE");
    }

    return ok(null);
  }),

  http.post("*/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      phone?: string;
      type?: number;
      code?: string;
    };

    if (body.type !== 1) {
      return fail("演示环境仅支持验证码登录", "MOCK-LOGIN-TYPE");
    }

    if (!body.phone || !PHONE_PATTERN.test(body.phone)) {
      return fail("请输入正确的手机号", "MOCK-PHONE");
    }

    if (body.code !== "123456") {
      return fail("验证码错误", "AUTH-20001");
    }

    return ok(`mock-token-${body.phone.slice(-4)}`);
  }),

  http.post("*/api/auth/logout", () => ok(null)),

  http.post("*/api/user/me", () => ok(getMe())),

  http.post("*/api/user/findById", async ({ request }) => {
    const body = (await request.json()) as { userId?: number };
    const user = getUser(Number(body.userId));

    return user ? ok(user) : fail("该用户不存在", "MOCK-USER-404");
  }),

  http.post("*/api/user/findByIds", async ({ request }) => {
    const body = (await request.json()) as { userIds?: number[] };
    const users = (body.userIds ?? [])
      .map((userId) => getUser(Number(userId)))
      .filter((user) => user !== null);

    return ok(users);
  }),

  http.post("*/api/note/feed", async ({ request }) => {
    const body = (await request.json()) as {
      pageNo?: number;
      pageSize?: number;
      tab?: FeedTab;
      noteType?: number;
    };
    const noteType =
      body.noteType === 0 || body.noteType === 1 ? body.noteType : undefined;

    return page(
      listFeed(
        Number(body.pageNo) || 1,
        Number(body.pageSize) || 10,
        body.tab ?? "recommend",
        noteType,
      ),
    );
  }),

  http.post("*/api/note/detail", async ({ request }) => {
    const body = (await request.json()) as { id?: number };
    const detail = getNoteDetail(Number(body.id));

    return detail ? ok(detail) : fail("笔记不存在或已删除", "MOCK-NOTE-404");
  }),

  http.post("*/api/note/like", async ({ request }) => {
    const body = (await request.json()) as { noteId?: number };
    setLiked(Number(body.noteId), true);
    return ok(null);
  }),

  http.post("*/api/note/unlike", async ({ request }) => {
    const body = (await request.json()) as { noteId?: number };
    setLiked(Number(body.noteId), false);
    return ok(null);
  }),

  http.post("*/api/note/liked/status", async ({ request }) => {
    const body = (await request.json()) as { noteIds?: number[] };
    return ok(getLikedStatus((body.noteIds ?? []).map(Number)));
  }),

  http.post("*/api/note/publish", async ({ request }) => {
    const body = (await request.json()) as PublishNoteRequest;
    publishNote(body);
    return ok(null);
  }),

  http.post("*/api/relation/follow", async ({ request }) => {
    const body = (await request.json()) as { followUserId?: number };
    setFollowing(Number(body.followUserId), true);
    return ok(null);
  }),

  http.post("*/api/relation/unfollow", async ({ request }) => {
    const body = (await request.json()) as { followUserId?: number };
    setFollowing(Number(body.followUserId), false);
    return ok(null);
  }),

  http.post("*/api/relation/status", async ({ request }) => {
    const body = (await request.json()) as { userId?: number };
    return ok({ following: isFollowing(Number(body.userId)) });
  }),

  http.post("*/api/relation/following/list", async ({ request }) => {
    const body = (await request.json()) as {
      pageNo?: number;
      pageSize?: number;
    };

    return page(
      listFollowing(Number(body.pageNo) || 1, Number(body.pageSize) || 10),
    );
  }),

  http.post("*/api/relation/fans/list", async ({ request }) => {
    const body = (await request.json()) as {
      pageNo?: number;
      pageSize?: number;
    };

    return page(
      listFans(Number(body.pageNo) || 1, Number(body.pageSize) || 10),
    );
  }),

  http.post("*/api/file/upload", () =>
    ok(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#fe2c55"/><circle cx="300" cy="360" r="140" fill="rgba(255,255,255,0.2)"/></svg>',
      )}`,
    ),
  ),
];
