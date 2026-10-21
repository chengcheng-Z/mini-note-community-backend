import { post } from "./client";
import type { UserInfo } from "./types";

export function fetchMe(): Promise<UserInfo> {
  return post<UserInfo>("/user/me");
}

export function fetchUser(userId: number): Promise<UserInfo> {
  return post<UserInfo>("/user/findById", { userId });
}
