import type { LoginRequest } from "./types";
import { post } from "./client";

export function sendVerificationCode(phone: string): Promise<null> {
  return post<null>("/auth/verification/code/send", { phone });
}

export function loginWithCode(phone: string, code: string): Promise<string> {
  const payload: LoginRequest = { phone, type: 1, code };
  return post<string>("/auth/login", payload);
}

export function logout(): Promise<null> {
  return post<null>("/auth/logout");
}
