import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchFeed } from "@/api/notes";
import type { FeedTab } from "@/api/types";

const PAGE_SIZE = 10;

export function useInfiniteFeed(tab: FeedTab) {
  return useInfiniteQuery({
    queryKey: ["feed", tab],
    queryFn: ({ pageParam }) =>
      fetchFeed({ pageNo: pageParam, pageSize: PAGE_SIZE, tab }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNo < lastPage.totalPage ? lastPage.pageNo + 1 : undefined,
  });
}
