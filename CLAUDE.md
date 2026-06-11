# CLAUDE.md

PrayU 웹 프로젝트에서 AI agent가 작업할 때 따라야 하는 가이드.
이 프로젝트는 AI agent 도입 이전에 시작되었으며, 기존 사용자 흐름을 보존하면서 점진적으로 개선하는 것을 최우선으로 한다.

## 제품 이해

- 기도제목을 나누고 함께 기도하는 **모바일 중심** 서비스
- 웹앱 + 앱 WebView(`window.flutter_inappwebview`) 하이브리드 구조
- 핵심 도메인: 인증, 그룹, 멤버, 기도카드, 감사카드, 알림, QT/말씀카드

## 명령어

```bash
npm run dev            # 개발 서버
npm run lint           # ESLint (--max-warnings 0)
npm run build          # tsc -b && vite build
npm run supabase-sync  # Supabase 타입 재생성 → supabase/types/database.ts
```

## 기술 스택과 구조

React 18 + TypeScript + Vite 5 / Tailwind + Radix(shadcn/ui) + Vaul / Zustand + Immer / Supabase (Auth, DB, Edge Functions) / Sentry / Vercel 배포

- `src/App.tsx`: 전체 라우트 중심 (40+ 라우트)
- `src/AppInit/AppInit.tsx`: WebView 감지, `--vh` 보정, 푸시 이동 처리
- `src/stores/baseStore.ts`: 핵심 전역 상태 + 비즈니스 액션 집약 (대형 단일 스토어)
- `src/apis/*`: Supabase/외부 API 호출 계층 — 원격 호출은 여기에 둔다
- `src/components/auth/*`: 인증, PrivateRoute
- `src/components/ui/*`: 공용 UI primitives — 새 UI는 먼저 여기 재사용 검토
- `src/lib/utils.ts`: KST 날짜 유틸 등 공통 유틸
- `supabase/types/*`: 생성 산출물 — 수동 수정 시 반드시 이유를 남긴다

## 의사결정 우선순위

1. 기존 사용자 흐름을 깨지 않는가
2. 모바일 사용성과 앱 내 동작을 유지하는가
3. 타입 안정성과 데이터 정합성을 유지하는가
4. 변경 범위가 작고 되돌리기 쉬운가
5. 새 추상화가 기존 구조보다 실제로 단순한가

## 가드레일

- **기존 흐름 보존**: 로그인/로그아웃, 그룹 조회·생성·가입, 기도카드 CRUD, 감사카드 생성·공유, 알림 진입, Kakao callback, WebView 진입·푸시 이동은 회귀 없이 유지
- **모바일 우선**: `max-w-[480px]` 기반 레이아웃, `--vh` 높이 계산을 함부로 바꾸지 않는다
- **KST 기준 날짜**: 날짜 로직은 `src/lib/utils.ts`의 KST 유틸 재사용. UTC 계산을 섞어 저장/조회 조건을 바꾸지 않는다
- **데이터 접근 패턴**: 컴포넌트에서 직접 Supabase 쿼리를 늘리지 않는다. 전역 상태는 기존 Zustand 패턴, 일회성 UI 상태는 지역 상태 우선
- **환경변수 보호**: `.env` 값 추측 금지. `VITE_ENV` 분기는 staging/prod 동작에 직접 영향 — 임의 변경 금지
- **소프트 삭제**: `deleted_at` 기준이 일관되게 적용되는지 확인. 쿼리에 `.is("deleted_at", null)` 누락 주의
- **에러 처리**: 원격 호출 실패는 삼키지 않고 Sentry 캡처 또는 사용자 피드백. null 반환 패턴이 많으므로 호출부 처리까지 함께 본다
- **문구는 한국어 UX** 맥락 유지, import alias는 `@/` 사용

## 피해야 할 작업

- 전체 라우팅 구조 한 번에 재작성
- `baseStore`를 근거 없이 대분해
- 인증/권한 로직 무단 변경
- Supabase 테이블/컬럼명 추정 수정 (스키마 변경은 migration + 타입 재생성 + 프론트 영향 확인)
- analytics 이벤트명 대량 변경
- WebView 브리지 동작 무검증 수정
- `index.html`, `vercel.json`, `vite.config.ts`를 목적 외로 수정

## 사람 확인이 필요한 변경

DB schema, 인증 흐름, analytics 이벤트 정의, Sentry 설정, 배포 설정, 공유/callback URL, 핵심 UX 문구

## 검증 기준

- `npm run lint` + `npm run build` 통과 (기존 경고 4개는 알려진 상태)
- 라우트 변경 시 관련 페이지 수동 확인
- Supabase 연동 변경 시 실패/빈값/null 케이스 확인
- 라우트 파라미터 비정상 값(uuid 아님, 미존재 id)에서도 안전하게 실패하는지 확인

## 배포 전 체크 (요약)

- 비로그인 보호 라우트 접근 차단, 로그인 redirect 흐름 확인
- iOS/Android WebView에서 로그인·라우팅·공유 동작 확인 (`flutter_inappwebview` 없는 환경에서도 깨지지 않아야 함)
- 새로고침 시 모든 라우트 진입 확인 (Vercel rewrite)
- Sentry 이벤트 수집 확인, 에러 메시지에 민감정보 미포함
- 초기 번들 크기, 첫 진입 경로의 대형 asset 확인
- 클라이언트 번들에 시크릿 미노출 확인

핵심 QA 시나리오: 비로그인 첫 진입 → 로그인 → 그룹 진입/생성/초대 → 기도카드 생성·수정·조회 → 감사카드 생성·공유 → 알림 이동 → Kakao callback → 잘못된 URL 접근 → 네트워크 실패 처리
