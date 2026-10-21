import { ApiError, UNAUTHORIZED_EVENT } from "./client";
import { clearToken, getToken } from "./session";
import type { ResponseEnvelope } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/file/upload`);

    const token = getToken();

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 401) {
        clearToken();
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        reject(new ApiError("登录已失效，请重新登录", undefined, 401));
        return;
      }

      try {
        const payload = JSON.parse(xhr.responseText) as ResponseEnvelope<
          string | null
        >;

        if (!payload.success || !payload.data) {
          reject(new ApiError(payload.message ?? "上传失败"));
          return;
        }

        resolve(payload.data);
      } catch {
        reject(new ApiError("上传失败，请稍后重试", undefined, xhr.status));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new ApiError("网络异常，上传失败"));
    });

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}
