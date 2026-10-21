import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { uploadFile } from "@/api/files";
import { publishNote } from "@/api/notes";
import type { PublishNoteRequest } from "@/api/types";
import styles from "./PublishPage.module.css";

type Mode = "image" | "video";
type UploadStatus = "uploading" | "done" | "error";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  url?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
};

const MAX_IMAGES = 9;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function createPreview(file: File): string {
  if (typeof URL.createObjectURL !== "function") {
    return "";
  }

  return URL.createObjectURL(file);
}

function revokePreview(url: string): void {
  if (url && typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

export default function PublishPage() {
  const [mode, setMode] = useState<Mode>("image");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => revokePreview(item.previewUrl));
    },
    [],
  );

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function startUpload(item: UploadItem) {
    try {
      const url = await uploadFile(item.file, (progress) => {
        updateItem(item.id, { progress });
      });
      updateItem(item.id, { url, progress: 100, status: "done" });
    } catch (err) {
      updateItem(item.id, {
        status: "error",
        error: err instanceof ApiError ? err.message : "上传失败",
      });
    }
  }

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError("");

    if (selected.length === 0) {
      return;
    }

    if (mode === "image") {
      if (items.length + selected.length > MAX_IMAGES) {
        setError(`最多选择 ${MAX_IMAGES} 张图片`);
        return;
      }

      if (selected.some((file) => !IMAGE_TYPES.includes(file.type))) {
        setError("仅支持 JPG/PNG/WebP/GIF 图片");
        return;
      }

      if (selected.some((file) => file.size > MAX_IMAGE_SIZE)) {
        setError("单张图片不能超过 10MB");
        return;
      }
    } else {
      if (items.length + selected.length > 1) {
        setError("视频只能选择 1 个");
        return;
      }

      if (selected.some((file) => !VIDEO_TYPES.includes(file.type))) {
        setError("仅支持 MP4/WebM/MOV 视频");
        return;
      }

      if (selected.some((file) => file.size > MAX_VIDEO_SIZE)) {
        setError("视频不能超过 200MB");
        return;
      }
    }

    const nextItems = selected.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      previewUrl: createPreview(file),
      progress: 0,
      status: "uploading" as const,
    }));

    setItems((current) => [...current, ...nextItems]);
    nextItems.forEach((item) => void startUpload(item));
  }

  function removeItem(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);

      if (target) {
        revokePreview(target.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function changeMode(nextMode: Mode) {
    if (nextMode === mode) {
      return;
    }

    items.forEach((item) => revokePreview(item.previewUrl));
    setItems([]);
    setError("");
    setMode(nextMode);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError(mode === "image" ? "请至少选择一张图片" : "请选择一个视频");
      return;
    }

    if (items.some((item) => item.status === "uploading")) {
      setError("请等待文件上传完成");
      return;
    }

    if (items.some((item) => item.status === "error")) {
      setError("有文件上传失败，请重试或移除");
      return;
    }

    const uris = items
      .map((item) => item.url)
      .filter((url): url is string => Boolean(url));

    const payload: PublishNoteRequest =
      mode === "image"
        ? { type: 0, imgUris: uris, title, content }
        : { type: 1, videoUri: uris[0], title, content };

    setSubmitting(true);

    try {
      await publishNote(payload);
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "发布失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>发布笔记</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.modeRow} role="group" aria-label="笔记类型">
          <button
            type="button"
            aria-pressed={mode === "image"}
            className={
              mode === "image" ? `${styles.mode} ${styles.active}` : styles.mode
            }
            onClick={() => changeMode("image")}
          >
            图文
          </button>
          <button
            type="button"
            aria-pressed={mode === "video"}
            className={
              mode === "video" ? `${styles.mode} ${styles.active}` : styles.mode
            }
            onClick={() => changeMode("video")}
          >
            视频
          </button>
        </div>

        {mode === "image" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>图片</span>
              <span className={styles.counter}>
                {items.length} / {MAX_IMAGES}
              </span>
            </div>

            <div className={styles.imageGrid}>
              {items.map((item) => (
                <div key={item.id} className={styles.thumb} data-status={item.status}>
                  <img src={item.previewUrl} alt={item.file.name} />
                  {item.status !== "done" && (
                    <span className={styles.progress}>
                      {item.status === "error" ? "失败" : `${item.progress}%`}
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`移除 ${item.file.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {items.length < MAX_IMAGES && (
                <label className={styles.addTile}>
                  <span>+</span>
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept={IMAGE_TYPES.join(",")}
                    aria-label="选择图片"
                    multiple
                    onChange={handleSelect}
                  />
                </label>
              )}
            </div>

            {items.map((item) =>
              item.status === "error" ? (
                <p key={item.id} className={styles.fileError}>
                  {item.file.name}：{item.error}
                  <button
                    type="button"
                    className={styles.retry}
                    onClick={() => {
                      updateItem(item.id, {
                        status: "uploading",
                        error: undefined,
                        progress: 0,
                      });
                      void startUpload(item);
                    }}
                  >
                    重试
                  </button>
                </p>
              ) : null,
            )}
          </section>
        ) : (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>视频</span>
              <span className={styles.counter}>
                {items.length > 0 ? "视频已选择" : "未选择"}
              </span>
            </div>

            {items.length === 0 ? (
              <label className={styles.videoPicker}>
                <span>选择一个视频</span>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept={VIDEO_TYPES.join(",")}
                  aria-label="选择视频"
                  onChange={handleSelect}
                />
              </label>
            ) : (
              <div className={styles.videoPreview}>
                <video
                  src={items[0].previewUrl}
                  controls
                  playsInline
                  preload="metadata"
                />
                <div className={styles.videoMeta}>
                  <span>{items[0].file.name}</span>
                  <span className={styles.counter}>
                    {items[0].status === "uploading"
                      ? `${items[0].progress}%`
                      : items[0].status === "error"
                        ? items[0].error
                        : "上传完成"}
                  </span>
                  <button
                    type="button"
                    className={styles.retry}
                    onClick={() => removeItem(items[0].id)}
                  >
                    移除
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <label className={styles.field}>
          <span className={styles.label}>标题</span>
          <input
            className={styles.input}
            maxLength={20}
            value={title}
            placeholder="写个标题（最多 20 字）"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>正文</span>
          <textarea
            className={styles.textarea}
            maxLength={1000}
            rows={5}
            value={content}
            placeholder="分享你的故事（最多 1000 字）"
            onChange={(event) => setContent(event.target.value)}
          />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={styles.submit}
          disabled={submitting}
        >
          {submitting ? "发布中..." : "发布"}
        </button>
      </form>
    </div>
  );
}
