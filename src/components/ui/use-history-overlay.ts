import { useEffect, useRef } from "react";

/**
 * 오버레이(드로워·다이얼로그·시트·팝오버)를 브라우저 히스토리와 연동한다.
 *
 * - 열릴 때 `{open:true}` 엔트리를 한 칸 쌓아, 안드로이드 하드웨어 백/브라우저
 *   뒤로가기가 페이지 이탈 대신 오버레이를 닫게 한다
 * - 뒤로가기 "외"의 방법(스와이프·X·항목 선택)으로 닫히면 쌓은 엔트리를 직접 회수한다.
 *   회수하지 않으면 유령 엔트리가 남고, 거기에 뒤로가기로 착지한 순간 마운트된
 *   오버레이들의 정리 코드가 동시에 back() 을 불러 두 칸 이상 튕겼다 (2026-08-17 버그)
 * - 닫으면서 페이지 이동까지 하는 흐름은 `navigate(path, { replace: true })` 를 쓴다 —
 *   유령 엔트리가 새 페이지로 덮여 회수가 필요 없다 (CreateActionSheet 참조)
 *
 * 히스토리 조작이 이 파일 밖으로 새어 나가게 하지 말 것. 과거에는 같은 정리 코드가
 * 소비 컴포넌트 12곳에 복붙되어 있었고 그것이 오버슈트의 원인이었다.
 */

// 오버레이 인스턴스들이 엔트리 "한 칸"을 공유한다 (중첩 오버레이가 칸을 늘리지 않는다).
// 그래서 장부도 모듈 수준이어야 한다 — 인스턴스별 장부는 동시 전환(메뉴 닫힘 + 드로워 열림)에서
// 서로의 상태를 모른 채 back() 을 겹쳐 부른다.
let openCount = 0; // 열려 있는 히스토리 연동 오버레이 수
let entryLive = false; // 우리가 쌓은 엔트리가 스택 최상단에 살아 있는가

const closers = new Set<(open: boolean) => void>();

const handlePopState = () => {
  // 엔트리가 뒤로가기로 소비됐다 — 전이 이펙트가 또 back() 하지 않도록 먼저 지운다
  entryLive = false;
  closers.forEach((close) => close(false));
};

// 닫힘 전이 직후가 아니라 마이크로태스크로 미뤄 회수한다.
// 같은 커밋에서 "A 닫힘 + B 열림"이 일어나면 이펙트 실행 순서에 따라 A 가
// B 보다 먼저 돌 수 있는데, 그 시점에 back() 하면 B 가 열리자마자 닫힌다.
const reclaimEntry = () => {
  queueMicrotask(() => {
    if (openCount > 0 || !entryLive) return;
    entryLive = false;
    if (window.history.state?.open === true) window.history.back();
  });
};

export function useHistoryOverlay(
  open: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined
) {
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!onOpenChange) return;
    closers.add(onOpenChange);
    if (closers.size === 1) window.addEventListener("popstate", handlePopState);
    return () => {
      closers.delete(onOpenChange);
      if (closers.size === 0)
        window.removeEventListener("popstate", handlePopState);
    };
  }, [onOpenChange]);

  useEffect(() => {
    const prevOpen = prevOpenRef.current;
    prevOpenRef.current = open === true;

    if (open && !prevOpen) {
      openCount += 1;
      if (window.history.state?.open !== true) {
        window.history.pushState({ open: true }, "", "");
        entryLive = true;
      }
    } else if (prevOpen && !open) {
      openCount = Math.max(0, openCount - 1);
      reclaimEntry();
    }
  }, [open]);

  // 열린 채 언마운트되면(라우트 전환 등) 닫힘 전이가 없다 — 여기서 장부를 맞춘다
  useEffect(
    () => () => {
      if (prevOpenRef.current) {
        openCount = Math.max(0, openCount - 1);
        reclaimEntry();
      }
    },
    []
  );
}
