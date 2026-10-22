import { useEffect, useRef } from "react";
import { ApiError } from "@/api/client";
import type { FeedTab, NoteType } from "@/api/types";
import NoteCard from "@/components/NoteCard";
import WaterfallGrid from "@/components/WaterfallGrid";
import {
  EmptyState,
  ErrorState,
  FeedSkeleton,
} from "@/components/states";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { readHomeScroll } from "@/lib/scrollMemory";
import styles from "./NoteFeed.module.css";

export default function NoteFeed({
  tab,
  noteType,
  restoreScroll = false,
  emptyTitle = "还没有内容",
  emptyDescription,
}: {
  tab: FeedTab;
  noteType?: NoteType;
  restoreScroll?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const feed = useInfiniteFeed(tab, noteType);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const restoredScrollRef = useRef(false);

  const notes = feed.data?.pages.flatMap((page) => page.data) ?? [];
  const errorMessage =
    feed.error instanceof ApiError ? feed.error.message : "内容加载失败";
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = feed;

  useEffect(() => {
    const node = sentinelRef.current;

    if (
      !node ||
      !hasNextPage ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!restoreScroll || restoredScrollRef.current || feed.isPending) {
      return;
    }

    const saved = readHomeScroll();

    if (saved !== null) {
      window.scrollTo({ top: saved });
    }

    restoredScrollRef.current = true;
  }, [restoreScroll, feed.isPending]);

  return (
    <>
      {feed.isPending && (
        <WaterfallGrid>
          <FeedSkeleton />
        </WaterfallGrid>
      )}

      {feed.isError && !feed.isPending && (
        <ErrorState
          message={errorMessage}
          onRetry={() => void feed.refetch()}
        />
      )}

      {!feed.isPending && !feed.isError && notes.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {notes.length > 0 && (
        <WaterfallGrid>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </WaterfallGrid>
      )}

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {feed.isFetchingNextPage && (
        <p className={styles.status}>加载中...</p>
      )}

      {!feed.isPending &&
        !feed.hasNextPage &&
        !feed.isError &&
        notes.length > 0 && <p className={styles.status}>没有更多了</p>}
    </>
  );
}
