# PrayU 보안 백로그

마이그레이션 체계 도입 과정(2026-06~07, `supabase-migration-plan.md`)에서 발견·정리된 보안 과제 목록.
여기 항목들은 **운영 중 서비스에 대한 변경**이므로 각각 별도 이슈/PR로, 사람 확인 하에 진행한다.

## 1. RLS 전면 정비 — 🔴 최우선

현행 정책 대부분이 `USING (true)` 계열의 무제한 허용이다. 원본 목록은 baseline
(`PrayU-Api/supabase/migrations/20260718075321_initial_baseline.sql`)의 `CREATE POLICY` 구문 참조.

핵심 문제 패턴:
- **그룹 격리 부재**: `group`/`member`/`pray`/`pray_card` 의 SELECT 가 `TO authenticated USING (true)` — 로그인만 하면 **소속 무관 전체 그룹의 기도 데이터를 조회 가능**. 기도제목은 민감 정보다
- `bible_card`·`group_union` 등의 UPDATE 도 `USING (true)` (역할만 authenticated)
- 설계 방향: `member` 조인 기반 멤버십 정책으로 재작성 (예: "내가 속한 그룹의 pray_card 만 SELECT")
- 성능 유의: RLS 서브쿼리 도입 시 기존 인덱스(멤버십 조회 경로)와 함께 검토

진행 방식: 테이블별 마이그레이션으로 쪼개서 로컬 → staging에서 앱 전 플로우 회귀 확인 후 prod.
`rls_auto_enable` event trigger(신규 테이블 RLS 자동 활성화)는 prod에 이미 존재 — 유지.

## 2. Kakao client secret 프론트 노출 — 🔴

`VITE_KAKAO_CLIENT_SECRET_KEY` 가 web 번들에 포함된다 (`KakaoTokenRepo.fetchKakaoToken` 이
브라우저에서 직접 kauth.kakao.com 토큰 교환). 조치:
1. 토큰 교환을 Edge Function 으로 이전 (secret 은 함수 시크릿으로)
2. Kakao 콘솔에서 client secret 로테이션 (기존 값은 노출된 것으로 간주)
3. web 에서 `VITE_KAKAO_CLIENT_SECRET_KEY` 제거

## 3. service_role 키(legacy JWT) 로테이션 — ⚠️ 결합 주의

- prod `cron.job` 명령(오늘의기도 리마인더 `net.http_post`)에 **prod service_role JWT 가 하드코딩**돼 있다
- fcm webhook 쪽 하드코딩은 제거 완료 (`drop_legacy_fcm_webhook`)
- **로테이션 시 cron.job 명령 갱신을 동시에** 하지 않으면 리마인더 알림이 죽는다
- 장기적으로는 cron 이 Vault 에서 키를 읽도록 개선 검토

## 4. 어드민 권한 체계 — 이메일 하드코딩 제거

- `AdminPage.tsx` 의 하드코딩 이메일 체크
- `profiles` 의 `admin can update profiles` 정책도 이메일 배열 하드코딩
- 방향: DB 롤 또는 custom claim 기반 권한으로 통일 (1번 RLS 정비와 함께 설계)

## 5. QT 엔드포인트 무제한 공개 LLM 프록시 — 🔴 시급

`POST /openai/qt`가 공개 anon key만으로 무제한 OpenAI 호출 가능. bible(#33)과 동일 유형이며 인프라(`llm_usage_log`)는 준비됨.
계획: `PrayU-Api/docs/qt-llm-usage-limit-plan.md`

## 6. authMiddleware JWT 서명 미검증 — ⚠️

미들웨어가 decode만 수행, 게이트웨이 verify_jwt(암묵 기본값)에 전적 의존. 함수 하나가 verify_jwt=false로 배포되면 위조 JWT 통과.
계획: `PrayU-Api/docs/auth-jwt-verification-plan.md`

## 7. POST /api/users가 anon으로 auth.admin.createUser 실행 — ⚠️

공개 anon key로 임의 이메일 계정 생성 가능. 웹 사용처 0건(DELETE만 사용)이라 제거가 기본안.
계획: `PrayU-Api/docs/api-users-hardening-plan.md`

## 완료된 항목

- ✅ fcm_notification_webhook 제거 — service_role 키 하드코딩 지점 1곳 소멸 (2026-07-20, Api#28 파이프라인)
- ✅ bible 무제한 쓰기 정책(update/insert `USING(true)`) 제거 (2026-07-24, Api#32)

## 권장 진행 순서

5(QT — 비용 노출이 즉각적, 인프라 준비됨) → 2(Kakao secret — 노출 면적이 가장 공개적) → 6·7(Api 인증 보강 — 소규모) → 1(RLS — 파급 크므로 테이블별 분할) → 4(어드민, 1과 함께) → 3(키 로테이션 — 1·2 마무리 후 일괄)
