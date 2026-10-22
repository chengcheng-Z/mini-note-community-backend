import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchFeed } from "@/api/notes";
import type { FeedTab, NoteType } from "@/api/types";

const PAGE_SIZE = 10;

export function useInfiniteFeed(tab: FeedTab, noteType?: NoteType) {
  return useInfiniteQuery({
    queryKey: ["feed", tab, noteType ?? "all"],
    queryFn: ({ pageParam }) =>
      fetchFeed({
        pageNo: pageParam,
        pageSize: PAGE_SIZE,
        tab,
        ...(noteType === undefined ? {} : { noteType }),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNo < lastPage.totalPage ? lastPage.pageNo + 1 : undefined,
  });
}
