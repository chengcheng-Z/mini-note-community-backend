import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/client";
import { fetchNoteDetail } from "@/api/notes";
import FollowButton from "@/components/FollowButton";
import ImageCarousel from "@/components/ImageCarousel";
import LikeButton from "@/components/LikeButton";
import VideoPlayer from "@/components/VideoPlayer";
import { ErrorState } from "@/components/states";
import { useFollow } from "@/hooks/useFollow";
import { useLike } from "@/hooks/useLike";
import styles from "./NoteDetailPage.module.css";

function formatDate(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("zh-CN");
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const query = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteDetail(noteId),
    enabled: Number.isInteger(noteId) && noteId > 0,
  });

  const note = query.data;
  const like = useLike(noteId, note?.liked ?? false);
  const follow = useFollow(
    note?.creatorId ?? 0,
    noteId,
    note?.following ?? false,
  );

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/");
  }

  const errorMessage =
    query.error instanceof ApiError ? query.error.message : "笔记加载失败";

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="返回"
          onClick={handleBack}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M15 5 8 12l7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className={styles.topbarTitle}>笔记</span>
        <button
          type="button"
          className={styles.textButton}
          onClick={handleShare}
        >
          分享
        </button>
      </div>

      {query.isPending && <div className={styles.loading}>加载中...</div>}

      {query.isError && (
        <ErrorState
          message={errorMessage}
          onRetry={() => void query.refetch()}
        />
      )}

      {note && (
        <article className={styles.article}>
          <div className={styles.media}>
            {note.type === 1 && note.videoUri ? (
              <VideoPlayer src={note.videoUri} title={note.title} />
            ) : (
              <ImageCarousel images={note.imgUris} title={note.title} />
            )}
          </div>

          <div className={styles.authorRow}>
            <div className={styles.author}>
              <img
                className={styles.avatar}
                src={note.avatar}
                alt=""
                loading="lazy"
              />
              <span>{note.creatorName}</span>
            </div>
            <FollowButton
              following={note.following}
              pending={follow.isPending}
              onToggle={follow.toggle}
            />
          </div>

          <h1 className={styles.title}>{note.title}</h1>
          <p className={styles.content}>{note.content}</p>

          <div className={styles.actions}>
            <LikeButton
              liked={note.liked}
              count={note.likeCount}
              pending={like.isPending}
              onToggle={like.toggle}
            />
            <button
              type="button"
              className={styles.shareButton}
              onClick={handleShare}
            >
              分享链接
            </button>
          </div>

          {like.error && (
            <p className={styles.error} role="alert">
              {like.error}
            </p>
          )}
          {follow.error && (
            <p className={styles.error} role="alert">
              {follow.error}
            </p>
          )}
          {copied && <p className={styles.notice}>链接已复制</p>}

          <p className={styles.meta}>发布于 {formatDate(note.updateTime)}</p>
        </article>
      )}
    </div>
  );
}
