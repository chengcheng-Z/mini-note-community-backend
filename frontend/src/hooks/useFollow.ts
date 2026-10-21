import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { followUser, unfollowUser } from "@/api/relations";
import type { NoteDetail } from "@/api/types";
import { useAuth } from "@/auth/useAuth";

export function useFollow(
  userId: number,
  noteId: number,
  following: boolean,
) {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (nextFollowing: boolean) =>
      nextFollowing ? followUser(userId) : unfollowUser(userId),
    onMutate: async (nextFollowing) => {
      await queryClient.cancelQueries({ queryKey: ["note", noteId] });
      const previousDetail = queryClient.getQueryData<NoteDetail>([
        "note",
        noteId,
      ]);

      queryClient.setQueryData<NoteDetail>(["note", noteId], (old) =>
        old ? { ...old, following: nextFollowing } : old,
      );

      return { previousDetail };
    },
    onError: (_error, _nextFollowing, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(["note", noteId], context.previousDetail);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      void queryClient.invalidateQueries({
        queryKey: ["relation", userId],
      });
    },
  });

  function toggle() {
    if (!isLoggedIn) {
      const redirect = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    mutation.mutate(!following);
  }

  const error = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : "关注失败，请稍后重试"
    : "";

  return {
    toggle,
    isPending: mutation.isPending,
    error,
  };
}
