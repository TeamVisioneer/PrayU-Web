# 데이터 fetch 규약 — TanStack Query

> 도입 배경·전환 로드맵: [plans/data-fetching-layer.md](../plans/data-fetching-layer.md)
> **신규 코드는 이 규약을 따른다.** 기존 화면(store fetch)은 화면 전환 작업이 닿을 때 이관한다.

## 계층 책임

```
apis/       IO 함수 — supabase 호출과 에러 캡처만. queryFn 으로 재사용된다
queries/    useQuery/useMutation 훅 — 키·신선도·무효화가 여기에만 있다
components/ 필요한 데이터를 쓰는 자리에서 훅으로 선언 — 페이지가 오케스트레이션하지 않는다
baseStore   UI 상태만 (드로워 열림·선택 상태). 서버 상태를 새로 넣지 않는다
```

## 규칙

1. **원격 읽기를 useEffect 에서 시작하지 않는다.** `queries/` 의 훅으로 선언한다.
   effect 는 외부 시스템 동기화(히스토리 API·WebView 브리지·analytics)에만 쓴다
2. **쿼리 키는 `[도메인, id, 파라미터]` 배열** — 예:
   `["myPrayCardCount", userId]` · `["prays", userId, "2026-08"]` · `["blockedProfiles", [...ids]]`
   키에 들어가는 파라미터가 곧 캐시 단위다 — 월별 데이터면 월 문자열을 키에 넣는다
3. **staleTime**: 전역 기본 60초. 잘 안 변하는 데이터(달력 월 데이터 등)는 훅에서 5분으로 올린다.
   `refetchOnWindowFocus` 는 전역 false — WebView 앱 특성상 포커스 리페치는 소음이다
4. **조건부 조회는 `enabled` 로 선언한다** — 빈 배열·비로그인·다이얼로그 닫힘 등.
   effect 분기나 호출부 if 로 우회하지 않는다
5. **쓰기 후에는 도메인 키를 invalidate 한다** — `queryClient.invalidateQueries({ queryKey: ["도메인"] })`.
   개별 캐시를 손으로 고치지 않는다 (setQueryData 는 낙관적 업데이트가 정말 필요할 때만)
6. **한 도메인이 쿼리로 전환되면 그 도메인의 store fetch 를 새로 소비하지 않는다** —
   공존 기간의 유일한 규칙. 어느 화면이 어느 패턴인지는 plans/data-fetching-layer.md 에서 관리

## 훅 작성 예

```ts
// src/queries/profile.ts
export const useMyPrayCardCount = (userId: string | undefined) =>
  useQuery({
    queryKey: ["myPrayCardCount", userId],
    queryFn: () => fetchUserPrayCardCount(userId!),
    enabled: !!userId,
  });
```

- queryFn 은 `apis/` 함수를 그대로 재사용한다 — supabase 호출을 훅 안에 새로 쓰지 않는다
- `null` 반환(기존 API 관례)은 실패로 간주해 throw 로 바꾸지 않는다 — 화면이 null 처리에 익숙하다.
  단, 새 API 를 만들 땐 throw + 쿼리 error 상태 사용을 권장
