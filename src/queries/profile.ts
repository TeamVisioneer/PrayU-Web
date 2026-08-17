import { useQuery } from "@tanstack/react-query";
import { fetchUserPrayCardCount } from "@/apis/prayCard";
import { fetchUserTotalPrayCount } from "@/apis/pray";
import { fetchMemberListByUserId } from "@/apis/member";
import { fetchProfileList } from "@/apis/profiles";

// 프로필 화면의 서버 상태 훅 — 규약: docs/guides/data-fetching.md
// queryFn 은 apis/ 를 그대로 재사용한다. supabase 호출을 여기 새로 쓰지 않는다.

export const useMyPrayCardCount = (userId: string | undefined) =>
  useQuery({
    queryKey: ["myPrayCardCount", userId],
    queryFn: () => fetchUserPrayCardCount(userId!),
    enabled: !!userId,
  });

export const useReceivedPrayCount = (userId: string | undefined) =>
  useQuery({
    queryKey: ["receivedPrayCount", userId],
    queryFn: () => fetchUserTotalPrayCount(userId!),
    enabled: !!userId,
  });

export const useMyMemberList = (userId: string | undefined) =>
  useQuery({
    queryKey: ["myMemberList", userId],
    queryFn: () => fetchMemberListByUserId(userId!),
    enabled: !!userId,
  });

// 차단 목록 프로필 — 설정 다이얼로그 전용. 열려 있고 차단이 있을 때만 조회한다
// (과거: 페이지 마운트마다 선제 fetch + 빈 배열이면 id=in.() 빈 쿼리 — 2026-08-17 계측)
export const useBlockedProfiles = (userIds: string[], enabled: boolean) =>
  useQuery({
    queryKey: ["blockedProfiles", userIds],
    queryFn: () => fetchProfileList(userIds),
    enabled: enabled && userIds.length > 0,
  });
