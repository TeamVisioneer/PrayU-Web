import { useQuery } from "@tanstack/react-query";
import {
  fetchPrayByDateRange,
  fetchReceivedPrayByDateRange,
} from "@/apis/pray";

// 기도 달력의 월 데이터 — 월 키("YYYY-MM")가 곧 캐시 단위다.
// 탭 전환·월 재방문 시 staleTime(5분) 안에서는 재요청하지 않는다.

const MONTH_STALE_TIME = 5 * 60_000;

const monthRange = (ym: string) => {
  const [year, month] = ym.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const end = month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`;
  return { start, end };
};

export const useMonthlyPrays = (userId: string | undefined, ym: string) =>
  useQuery({
    queryKey: ["prays", userId, ym],
    queryFn: () => {
      const { start, end } = monthRange(ym);
      return fetchPrayByDateRange(userId!, start, end);
    },
    enabled: !!userId,
    staleTime: MONTH_STALE_TIME,
  });

export const useMonthlyReceivedPrays = (
  userId: string | undefined,
  ym: string
) =>
  useQuery({
    queryKey: ["receivedPrays", userId, ym],
    queryFn: () => {
      const { start, end } = monthRange(ym);
      return fetchReceivedPrayByDateRange(userId!, start, end);
    },
    enabled: !!userId,
    staleTime: MONTH_STALE_TIME,
  });
