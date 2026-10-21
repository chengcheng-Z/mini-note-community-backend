import { clearToken, getToken } from "./session";
import type { PageEnvelope, ResponseEnvelope } from "./types";

export const UNAUTHORIZED_EVENT = "xh:unauthorized";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export class ApiError extends Error {
  readonly errorCode?: string;
  readonly status?: number;

  constructor(message: string, errorCode?: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.status = status;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "登录已失效，请重新登录", status = 401) {
    super(message, undefined, status);
    this.name = "UnauthorizedError";
  }
}

export class NetworkError extends ApiError {
  constructor(message = "网络异常，请稍后重试") {
    super(message);
    this.name = "NetworkError";
  }
}

export type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const payload = await send<T>(path, options);
  return payload.data;
}

async function send<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ResponseEnvelope<T>> {
  const { method = "POST", body, signal } = options;
  const headers: Record<string, string> = {};
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new NetworkError();
  }

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new UnauthorizedError();
  }

  let payload: ResponseEnvelope<T> | undefined;

  try {
    payload = (await response.json()) as ResponseEnvelope<T>;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `请求失败 (${response.status})`,
      payload?.errorCode,
      response.status,
    );
  }

  if (!payload) {
    throw new ApiError("响应格式错误", undefined, response.status);
  }

  if (payload.success === false) {
    throw new ApiError(
      payload.message ?? "请求失败",
      payload.errorCode,
      response.status,
    );
  }

  return payload;
}

export function post<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<T> {
  return request<T>(path, { ...options, method: "POST", body });
}

export function postPage<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<PageEnvelope<T>> {
  return send<T[]>(path, { ...options, method: "POST", body }) as Promise<
    PageEnvelope<T>
  >;
}

export function upload<T>(
  path: string,
  formData: FormData,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<T> {
  return request<T>(path, { ...options, method: "POST", body: formData });
}
