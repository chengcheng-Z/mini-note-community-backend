import { post, postPage } from "./client";
import type { PageEnvelope } from "./types";

export type RelationUser = {
  userId: number;
  avatar: string;
  nickname: string;
  introduction?: string;
  fansTotal?: number;
  noteTotal?: number;
};

export function followUser(userId: number): Promise<null> {
  return post<null>("/relation/follow", { followUserId: userId });
}

export function unfollowUser(userId: number): Promise<null> {
  return post<null>("/relation/unfollow", { followUserId: userId });
}

export function fetchFollowStatus(
  userId: number,
): Promise<{ following: boolean }> {
  return post<{ following: boolean }>("/relation/status", { userId });
}

export function fetchFollowingList(
  userId: number,
  pageNo: number,
): Promise<PageEnvelope<RelationUser>> {
  return postPage<RelationUser>("/relation/following/list", {
    userId,
    pageNo,
  });
}

export function fetchFansList(
  userId: number,
  pageNo: number,
): Promise<PageEnvelope<RelationUser>> {
  return postPage<RelationUser>("/relation/fans/list", { userId, pageNo });
}
