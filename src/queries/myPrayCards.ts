import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchUserPrayCardList } from "@/apis/prayCard";

// 내 기도카드 보관함 — 페이지네이션 상태가 쿼리에 내장된다.
// store 의 historyPrayCardList* 는 작성 플로우 소유로 남긴다 (plans/data-fetching-layer.md 전환 경계).

export const PAGE_SIZE = 18;

export const useMyPrayCardsInfinite = (userId: string | undefined) =>
  useInfiniteQuery({
    queryKey: ["myPrayCards", userId],
    queryFn: ({ pageParam }) =>
      fetchUserPrayCardList(userId!, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      // 마지막 페이지가 꽉 찼으면 다음 offset, 아니면 끝
      lastPage && lastPage.length === PAGE_SIZE
        ? allPages.length * PAGE_SIZE
        : undefined,
    enabled: !!userId,
  });
