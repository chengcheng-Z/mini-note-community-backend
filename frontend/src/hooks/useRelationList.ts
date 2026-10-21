import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchFansList, fetchFollowingList } from "@/api/relations";

export function useRelationList(
  kind: "following" | "fans",
  userId: number,
) {
  return useInfiniteQuery({
    queryKey: ["relationList", kind, userId],
    queryFn: ({ pageParam }) =>
      kind === "following"
        ? fetchFollowingList(userId, pageParam)
        : fetchFansList(userId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNo < lastPage.totalPage ? lastPage.pageNo + 1 : undefined,
    enabled: userId > 0,
  });
}
