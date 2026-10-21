import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { NoteFeedItem } from "@/api/types";
import { formatCount, formatDuration } from "@/lib/format";
import styles from "./NoteCard.module.css";

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function VideoPreview({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || typeof IntersectionObserver === "undefined") {
      return;
    }

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      data-testid="note-video"
      className={styles.media}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

export default function NoteCard({ note }: { note: NoteFeedItem }) {
  const duration = formatDuration(note.videoDuration);

  return (
    <article className={styles.card}>
      <Link to={`/note/${note.id}`} className={styles.link}>
        <div className={styles.coverWrap}>
          {note.type === 1 && note.videoUri ? (
            <VideoPreview src={note.videoUri} poster={note.cover} />
          ) : (
            <img
              className={styles.media}
              src={note.cover}
              alt={note.title}
              loading="lazy"
              decoding="async"
            />
          )}

          {note.type === 1 && duration && (
            <span data-testid="note-duration" className={styles.duration}>
              {duration}
            </span>
          )}
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>{note.title}</h2>
          <div className={styles.meta}>
            <img
              className={styles.avatar}
              src={note.creator.avatar}
              alt=""
              loading="lazy"
            />
            <span className={styles.author}>{note.creator.nickName}</span>
            <span
              className={styles.likes}
              aria-label={`${note.likeCount} 个赞`}
            >
              <HeartIcon />
              {formatCount(note.likeCount)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
