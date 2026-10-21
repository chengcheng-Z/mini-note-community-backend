import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { likeNote, unlikeNote } from "@/api/notes";
import type { NoteDetail, NoteFeedItem, PageEnvelope } from "@/api/types";
import { useAuth } from "@/auth/useAuth";

type FeedCache = InfiniteData<PageEnvelope<NoteFeedItem>>;

function patchFeed(
  cache: FeedCache | undefined,
  noteId: number,
  liked: boolean,
): FeedCache | undefined {
  if (!cache) {
    return cache;
  }

  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      data: page.data.map((note) => {
        if (note.id !== noteId) {
          return note;
        }

        const delta = note.liked === liked ? 0 : liked ? 1 : -1;

        return {
          ...note,
          liked,
          likeCount: Math.max(0, note.likeCount + delta),
        };
      }),
    })),
  };
}

function patchDetail(
  detail: NoteDetail | undefined,
  liked: boolean,
): NoteDetail | undefined {
  if (!detail) {
    return detail;
  }

  const delta = detail.liked === liked ? 0 : liked ? 1 : -1;

  return {
    ...detail,
    liked,
    likeCount: Math.max(0, detail.likeCount + delta),
  };
}

export function useLike(noteId: number, liked: boolean) {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (nextLiked: boolean) =>
      nextLiked ? likeNote(noteId) : unlikeNote(noteId),
    onMutate: async (nextLiked) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["feed"] }),
        queryClient.cancelQueries({ queryKey: ["note", noteId] }),
      ]);

      const previousDetail = queryClient.getQueryData<NoteDetail>([
        "note",
        noteId,
      ]);
      const previousFeeds = queryClient.getQueriesData<FeedCache>({
        queryKey: ["feed"],
      });

      queryClient.setQueryData<NoteDetail>(["note", noteId], (old) =>
        patchDetail(old, nextLiked),
      );
      queryClient.setQueriesData<FeedCache>({ queryKey: ["feed"] }, (old) =>
        patchFeed(old, noteId, nextLiked),
      );

      return { previousDetail, previousFeeds };
    },
    onError: (_error, _nextLiked, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(["note", noteId], context.previousDetail);

      for (const [key, data] of context.previousFeeds as Array<
        [QueryKey, FeedCache | undefined]
      >) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  function toggle() {
    if (!isLoggedIn) {
      const redirect = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    mutation.mutate(!liked);
  }

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : "点赞失败，请稍后重试"
    : "";

  return {
    toggle,
    isPending: mutation.isPending,
    error,
  };
}
