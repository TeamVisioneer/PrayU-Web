# Supabase 마이그레이션 체계 도입 (PrayU)

## 진행 현황 (2026-07-18)
- [x] Phase 0 — CLI 2.109.1 통일 (brew + web devDep + Api CI 핀), prod 워크플로우 name 오타 수정
- [x] Phase A — prod 덤프 + 수동 캡처 완료 (`PrayU-Api/supabase/_baseline/`, gitignore 처리)
- [x] Phase B — baseline 작성: `PrayU-Api/supabase/migrations/20260718075321_initial_baseline.sql`. web stale 마이그레이션·seed·빈 stub 삭제
- [x] Phase C(로컬) — 로컬 스택에서 `db reset` 무오류 재생, 스키마 검증 전 항목 prod 일치, 함수 5종 로컬 서빙 확인. web `.env.local.example` 추가
- [x] Phase C(앱 검증) — 로컬 카카오 로그인 E2E 통과 (config.toml kakao provider + .env 주입, 2026-07-18)
- [x] Phase D — staging in-place 리셋 완료 (2026-07-19): 백업 3종(스키마/전체데이터/bible 별도) → `db reset --linked` → 마이그레이션 2개 히스토리 기록, bible 31,138행 시드, Kakao 설정·버킷·RLS 보존/재생성 확인. **prod bible 기반 `supabase/seed.sql`(6MB) 신설 — 커밋 필요**
- [x] Phase D(앱 QA) — 리셋 산출물(로컬 스택, staging과 동일 마이그레이션) 대상 E2E 통과 (2026-07-19): 가입→profiles 트리거, 보호 라우트, 그룹 생성, 기도카드 4단계 생성, 말씀카드 생성(bible 시드 조회+openai 함수+storage 업로드+FK 연결), 콘솔 에러 0. 비차단 관찰: onesignal/users 400(테스트 유저 푸시 미등록 — 예상), 헤드리스 브라우저 한정 framer-motion 스텝 전환 지연(앱 이슈 아님)
- [x] Phase E — **완료 (2026-07-20)**: prod 전체 백업(스키마 25KB + 데이터 380MB, 핵심 테이블 행수 검증) → 히스토리 repair(20240727 reverted, baseline applied — SQL 무실행) → `db diff` 예상 차이 1건(레거시 webhook)만 확인 → `db push`로 drop_legacy 적용 → **최종 diff 空** = 세 환경(로컬/staging/prod) 마이그레이션 히스토리·스키마 완전 일치. 링크는 staging으로 복구. 리허설(로컬→staging→prod 파이프라인 1회 완주)도 이것으로 겸함
- [x] **레거시 `/bible-card` 플립 페이지 정리 완료 (2026-07-20)**: web — 플립 페이지 클러스터 5개 파일 + dead export(createBibleVerse/fetchBgImage) 제거, 그룹 메뉴는 현행 `/bible-card/new`로 리다이렉트(옛 URL도 Navigate 처리, analytics 이벤트 유지). Api — openai 함수의 vector 레거시 라우트 4종(bible-verse/bible-image/text-embedding/search-bible) + BibleCardService/BibleRepository/pixelsClient/type.ts 제거, `/qt`만 유지. 스모크: 제거 라우트 404, `/bible`·`/qt` 정상
- [ ] 후속 이슈 레이징 — 드리프트 fix (bible_card.user_id default, `''''''` 디폴트 4건, qt_data.long_label), bible FOR UPDATE 정책(RLS 작업), bible_id_seq=1 quirk

### 로컬 DB MCP (2026-07-24 등록)
- 두 레포 `.mcp.json`에 `prayu-local-db` 등록: `uvx postgres-mcp --access-mode=unrestricted` → 로컬 스택 DB(127.0.0.1:54322) 직결. **uv 설치 필요** (`brew install uv`)
- CLI 내장 `http://127.0.0.1:54321/mcp` 는 Kong의 OAuth 디스커버리 라우트 부재로 표준 클라이언트 연결 불가(supabase/mcp#257) → stdio 직결 방식 채택
- 용도: 로컬 스키마/데이터 실험·조회. **원격 접속 불가 구조**(주소 하드코딩). 확정 스키마 변경은 반드시 `db diff` → 마이그레이션 파일로
- 스택이 내려가 있으면 MCP 연결 실패(무해) — `./scripts/dev.sh` 로 올린 뒤 사용

### 타입 sync 정책 (2026-07-20 확정)
일상 개발은 원격을 읽지도 않는다. 세 환경이 같은 마이그레이션을 공유하므로 로컬 타입 = 배포 후 staging 타입 (검증 완료 — 메타 주석 제외 완전 일치).
- **web `npm run supabase-sync`**: 로컬 DB(`--db-url` 127.0.0.1:54322) 기준 — 개발 중 수시 실행
- **web `npm run supabase-sync-staging`**: staging(`--project-id`, 링크 불필요·읽기 전용) 기준 — 배포 시점 검증 앵커
- **Api `npm run supabase-sync`**: `--local` — 함수 개발 중 수시 실행
- 원격 링크(`supabase link`)는 일상 작업에서 사용하지 않는다. 원격 반영은 CI 전용

### Phase A 실측 기록 (덤프에서 확인된 것)
- 테이블 11개 (stale 파일의 `test` 테이블은 prod에 없음 — baseline 미포함)
- RLS 전 테이블 활성, 정책 34개, `rls_auto_enable` event trigger 존재 (baseline에선 권한 없으면 스킵하도록 방어)
- Storage 버킷: `prayu`(공개), `avatars`(비공개) + storage.objects 정책 4개
- Realtime publication: `member`, `notification`, `thanks_card` (web 훅 3개와 일치)
- auth 트리거: `on_auth_user_created` → `handle_new_user()`
- ⚠️ `fcm_notification_webhook` (notification→push 함수 호출): **prod에서 DISABLE 상태인 레거시**, 정의에 prod service_role JWT 하드코딩 → **baseline에서 제외**, 덤프 폴더는 gitignore
- ~~pg_cron 잔여 확인~~ **완료 (2026-07-18, 사용자 확인)**: **prod에만** cron 작업 존재 — `net.http_post`로 `onesignal/notifications/reminder` 호출 (`{"reminderType":"prayTime"}`, 오늘의기도 리마인더). staging은 없음·불필요. cron은 `cron.job` 데이터라 마이그레이션 대상 아님(환경별 운영 설정으로 관리)
- prod 함수 시크릿 인벤토리(이름): FIREBASE_{CLIENT_EMAIL,PRIVATE_KEY,PROJECT_ID}, KAKAO_ADMIN_KEY, ONESIGNAL_{ANDROID_CHANNEL_ID,API_KEY,APP_ID}, OPENAI_SECRET_KEY, PEXELS_API_KEY, SUPA_PROJECT_{URL,SERVICE_ROLE_KEY}

### 마이그레이션 밖에서 관리되는 환경별 운영 설정 대장 (2026-07-18 실측)
버전 관리 밖에 있으므로 여기가 유일한 기록. 변경 시 이 문서를 갱신할 것.
| 항목 | prod | staging |
|---|---|---|
| cron: 오늘의기도 리마인더 (`net.http_post` → `onesignal/notifications/reminder`) | **활성** | 없음 (불필요) |
| trigger: `fcm_notification_webhook` | ~~존재(DISABLE)~~ → **레거시 확정, `drop_legacy_fcm_webhook` 마이그레이션으로 제거 예정** | 리셋 시 자연 제거 |
| RLS event trigger: `rls_auto_enable` | 존재 | 없음 (baseline이 권한 되면 생성, 안 되면 스킵) |

⚠️ **키 로테이션 결합**: prod cron 명령과 fcm webhook 정의에 **prod service_role JWT(legacy)가 하드코딩**돼 있음. 추후 보안 작업에서 service_role 키 로테이션 시 **cron.job 명령 갱신을 동시에** 하지 않으면 리마인더 알림이 죽는다.

### staging↔prod 스키마 드리프트 (2026-07-18 staging 덤프 비교)
baseline은 prod 기준이므로 Phase D 리셋 시 staging에서 아래가 사라짐/변경됨 — 모두 의도된 정리:
- staging에만: `vector` extension(public), `search_bible` 함수 — **레거시 확정(사용자, 2026-07-18)**, 리셋이 자연 제거 (OK)
- `fcm_notification_webhook` — **레거시 확정(OneSignal 도입으로 대체)**: staging은 리셋이 제거, prod는 `20260718084009_drop_legacy_fcm_webhook` 마이그레이션이 제거 (Phase F 리허설 겸용 — 이 마이그레이션이 prod까지 흘러가면 Phase E의 db diff 잔여 불일치도 해소됨)
- 정책 차이 소수: bible_card/group_union update 정책 문구, admin 프로필 정책 이름 등 → prod 기준으로 통일됨 (OK)
- 🔴 **prod 정책 허점 발견**: `"update rls" ON public.bible FOR UPDATE USING (true)` — 인증 여부 무관 전체 업데이트 허용. staging은 FOR SELECT. **추후 RLS 보안 작업 1순위 후보** (baseline에는 prod 그대로 반영돼 있음 — 이번 작업 범위에서 임의 수정하지 않음)

## Context (왜 하는가)

현재 PrayU는 Supabase 프로젝트 2개(staging/prod)를 쓰지만 **마이그레이션 체계가 없다.**
- 로컬 dev가 staging DB를 직접 바라봄 → 개발 중 staging 데이터 오염 위험, 격리 없음
- 스키마 변경을 staging GUI에서 손으로 → 괜찮으면 prod GUI에서 또 손으로 → 배포. diff/리뷰/롤백 불가, 휴먼에러 상존
- PrayU-web에 커밋된 유일한 마이그레이션 `supabase/migrations/20240727_initial_migration.sql` 은 **이미 실제 스키마와 불일치**(테이블 6개 기재 vs 실제 12개, 게다가 쓰레기 `test` 테이블 포함). 즉 이 파일로는 현 스키마를 재현 못 함.

목표: **prod를 진실의 원천으로 baseline 마이그레이션을 만들고, dev=로컬 / staging=in-place 리셋 / prod=baseline 마킹**으로 세 환경을 마이그레이션 기반으로 통일한다. prod에는 DDL을 재실행하지 않아 무중단·무위험.

## 레포 역할 분담 (확정: A안)

Supabase 백엔드 상태(마이그레이션 + Edge Functions + config)는 **정확히 한 레포가 소유**해야 한다. 두 레포가 같은 원격 프로젝트에 각자 push하면 GUI 수작업 시절의 이원화가 레포 차원에서 재발한다.

| 레포 | 역할 |
|---|---|
| **PrayU-Api** | **백엔드 상태의 주인**: `supabase/migrations/`(신설), Edge Functions 소스, config.toml, seed. 모든 `db push`/`db dump`/`migration repair` 실행 위치. 로컬 스택(`scripts/dev.sh`)도 여기서 띄움 |
| **PrayU-web** | **소비자**: `supabase/client.ts` + 생성된 타입(`supabase/types/database.ts`)만 유지. 링크는 타입 생성(`supabase-sync`) 용도로만 |

- PrayU-Api 현황 (2026-06-22 확인): 함수 소스 전체 보유(api/bible/onesignal/openai/push/_shared), **마이그레이션 폴더 없음**(→ 충돌 없이 신설 가능), staging에 링크됨, GitHub Actions로 함수 배포(staging + prod는 release 트리거), `scripts/dev.sh` = `supabase start` + `functions serve --env-file ./.env`.
- **B안(모노레포 통합)은 마이그레이션 체계가 자리잡은 뒤 별도 단계로** 진행한다 (사용자 결정).
- ⚠️ 두 레포의 config.toml이 같은 포트(54321~)를 쓰므로 **로컬 스택은 PrayU-Api에서만 띄운다.** PrayU-web에서 `supabase start` 금지.

## 확정된 결정 (사용자)
1. **dev → 로컬 Supabase**(PrayU-Api의 `supabase start`, Docker)로 분리
2. **staging → 스키마 in-place 리셋** (프로젝트/URL/키/Auth/Storage/Functions/secrets 보존, DB만 baseline으로)
3. **baseline은 prod에서 추출**
4. **prod → baseline을 "이미 적용됨"으로 마킹**(DDL 재실행 금지)
5. **마이그레이션의 집은 PrayU-Api** (A안). 모노레포(B안)는 추후

## 확정된 사실 (2026-06-22 기준)
- **prod ref = `qggewtakkrwcclyxtxnz`** (`prayu_prod`, org `ackunsypyygaiudihuwa`). 접근 가능 ✅
- **staging ref = `cguxpeghdqcqfdhvkmyv`** (`prayu_staging`, 같은 org). 접근 가능 ✅. PrayU-web·PrayU-Api 둘 다 여기 링크됨. web 런타임 `.env`(VITE_SUPA_*)도 staging을 가리킴.
- (이전에 보이던 `bansuk-prod`/`gbszxqxsxqlkzgdinveh` 는 잘못 로그인된 다른 계정의 무관 프로젝트 — 절대 건드리지 않는다.)
- **CLI 버전 불일치**: 설치본 `2.75.0` / 최신 `2.107.x` / web devDep `^1.191.3` / PrayU-Api CI는 `version: latest` (미고정).

---

## Phase 0 — 사전 준비

1. ~~프로젝트 접근 확인~~ **완료 (2026-06-22)**: `prayu_prod`·`prayu_staging` 둘 다 접근 확인.
2. **CLI 버전 통일.** `brew upgrade supabase`(→2.107.x). web `package.json` 의 `"supabase": "^1.191.3"` 은 제거하거나 2.x로 통일. PrayU-Api CI(`supabase/setup-cli@v1`)의 `version: latest` 를 **명시 버전으로 핀** 권장. 이후 모든 명령은 2.x 기준. (1.x↔2.x는 `db diff`/`migration repair`/`db dump` 플래그·동작이 다름)
3. (발견 사항) PrayU-Api의 `.github/workflows/supabase-deploy-prod.yaml` 의 `name:` 이 "…Staging" 으로 잘못돼 있음 — 겸사겸사 수정.

> 본 계획의 모든 `supabase` 명령은 2.x 기준. `db push`/`db dump`/`migration repair` 는 `--project-ref` 플래그가 없고 `--linked`(기본) 또는 `--db-url` 만 받는다 → 대상 전환은 `supabase link` 또는 `--db-url` 로 한다.

---

## Phase A — prod에서 baseline 추출 (진실의 원천) — **실행 위치: PrayU-Api**

prod(`prayu_prod`)에 링크 후 스키마 덤프:
```
cd PrayU-Api
supabase link --project-ref qggewtakkrwcclyxtxnz          # prod(prayu_prod)
supabase db dump --linked -s public -f supabase/_baseline/01_public_schema.sql
```
> 주의: PrayU-Api는 현재 staging에 링크돼 있다. 위 link로 prod로 바꾼 뒤 작업하고, **Phase 끝나면 staging으로 링크 복구**(평시 기본 링크 = staging, prod는 명시적으로만).
- 2.x `db dump` 는 기본이 schema-only (`--schema-only` 플래그 없음). 데이터가 필요한 **참조 테이블만** 별도 `--data-only` (예: `bible`). 사용자 데이터(기도 내용 등 PII)는 절대 커밋 금지.
- RLS 정책/grant/extension/`public.handle_new_user` 함수 본문은 `-s public` 덤프에 포함됨 → 포함 여부 육안 확인.

### `db dump`가 누락하므로 수동 캡처해야 하는 것 (prod에 직접 쿼리)
1. **`auth.users` 트리거** (handle_new_user 연결): 함수는 public이라 덤프되지만 트리거는 auth 스키마라 누락.
   ```sql
   select pg_get_triggerdef(oid) from pg_trigger
   where tgrelid='auth.users'::regclass and not tgisinternal;
   ```
2. **Storage 버킷**: `select * from storage.buckets;` → migration에 `insert into storage.buckets(...)` 로 재현 + 로컬은 PrayU-Api `config.toml [storage.buckets.*]`.
3. **Realtime publication 멤버십**: `select * from pg_publication_tables where pubname='supabase_realtime';` → `alter publication supabase_realtime add table ...`.
4. **Vault 시크릿 이름**(값은 덤프 안 됨, 수동 재입력): `select name from vault.secrets;`
5. **Edge Function secrets**(이름만): `supabase secrets list` (DB 아님, 프로젝트별).
6. **cron/webhook**: pg_cron 미사용으로 추정 — `select * from cron.job;` 로 확인.
7. **Auth/OAuth 설정**(Kakao redirect 등): GoTrue 설정이라 DB 밖. 로컬은 `config.toml [auth.*]` 로 미러.
8. 쓰레기 `test` 테이블이 prod에 없으면 baseline에 옮기지 않는다.

---

## Phase B — baseline 마이그레이션 작성 — **집: PrayU-Api/supabase/migrations/**

- **PrayU-Api에 `supabase/migrations/` 신설** + 현 스키마를 완전 재현하는 단일 baseline 작성:
  ```
  cd PrayU-Api
  supabase migration new initial_baseline   # supabase/migrations/<stamp>_initial_baseline.sql 생성
  ```
  내용 = Phase A 덤프(public) + auth 트리거 + 버킷 insert + publication. extension 블록 유지(`CREATE EXTENSION IF NOT EXISTS` 라 재실행 안전).
- **PrayU-web의 stale 파일 삭제**: `PrayU-web/supabase/migrations/20240727_initial_migration.sql` 제거 (web은 이제 마이그레이션을 갖지 않는다). 빈 stub `PrayU-web/supabase/functions/bible/` 도 제거.
- web의 `supabase/` 에 남기는 것: `client.ts`, `types/`, `config.toml`(타입 생성 링크용), `seed.sql` 은 제거 가능.
- 원본 덤프(`supabase/_baseline/*`)는 migrations/ 밖에 두고, 데이터 덤프는 `.gitignore`.

---

## Phase C — 로컬 dev 구성 — **스택은 PrayU-Api에서, web은 env만**

A안 덕분에 대폭 단순화됨: PrayU-Api의 로컬 스택이 **DB와 함수를 같은 호스트(127.0.0.1:54321)에서** 서빙하므로, 기존에 검토했던 `VITE_SUPA_FUNCTIONS_URL` 분리 리팩터(web api 파일 4개 + Vercel env 추가)가 **불필요**하다. 프론트의 `${VITE_SUPA_PROJECT_URL}/functions/v1/...` 패턴이 로컬에서도 그대로 동작.

```
# PrayU-Api
./scripts/dev.sh          # = supabase start + functions serve --env-file ./.env --no-verify-jwt
supabase db reset         # migrations 재생 + seed
supabase gen types --lang=typescript --local > supabase/functions/_types/database.ts
```
- **PrayU-web `.env.local`**: `VITE_SUPA_PROJECT_URL=http://127.0.0.1:54321` + `VITE_SUPA_ANON_KEY=<로컬 anon key>` (`supabase start` 출력에 표시). 이 두 줄이 web 쪽 로컬 전환의 전부.
- **web 타입 생성**: 로컬 스택이 PrayU-Api에 있으므로 web의 `supabase-sync`(--linked)는 원격 기준 유지, 로컬 기준이 필요하면 `supabase gen types --lang=typescript --db-url postgresql://postgres:postgres@127.0.0.1:54322/postgres > supabase/types/database.ts` 스크립트(`supabase-sync-local`)를 web에 추가.
- 함수 로컬 실행에 필요한 시크릿(OpenAI/OneSignal 등)은 PrayU-Api `.env` 에 이미 존재(`dev.sh`가 --env-file로 주입).
- 카드 이미지 업로드용 버킷을 PrayU-Api `config.toml [storage.buckets.*]` 에 선언해야 로컬 storage 동작.

---

## Phase D — staging in-place 리셋 — **실행 위치: PrayU-Api**

목표: staging DB 스키마+데이터만 baseline으로, 프로젝트/URL/키/Auth(Kakao)/Storage 설정/Functions/secrets 보존.

- **권장: `db reset --linked` 대신 명시적 2단계** (가장 위험한 단일 명령 회피):
  1. 백업: `supabase db dump --db-url "<staging>" -f staging_backup.sql` (+ 필요시 `--data-only`)
  2. staging public 스키마 비우기(SQL editor/psql로 통제된 `drop schema public cascade; create schema public;` + 기본 grant 복구) — 또는 백업 확인했으면 `db reset --linked` 수용
  3. baseline push:
     ```
     supabase link --project-ref cguxpeghdqcqfdhvkmyv     # staging
     supabase db push --linked
     ```
- 리셋 후 **덤프에 안 담긴 상태 재적용**: vault 시크릿 값 재입력, realtime 테이블 재등록, 버킷 확인, `handle_new_user` 트리거 존재 확인. Kakao OAuth/redirect는 GoTrue 설정이라 보존되지만 재확인.
- staging의 기존 `auth.users` 처리 결정(보통 staging은 깨끗이 비움 — 안 비우면 profiles 고아 발생).

---

## Phase E — prod에 baseline "적용됨" 마킹 (DDL 재실행 금지) — **실행 위치: PrayU-Api**

```
supabase link --project-ref qggewtakkrwcclyxtxnz        # prod(prayu_prod)
supabase db diff --linked --schema public               # 출력 비어야 함 = baseline과 prod 일치 (staging/prod 드리프트 체크 겸용)
supabase migration repair --status applied <baseline_version> --linked
supabase migration repair --status reverted 20240727 --linked   # prod 히스토리에 있으면
supabase migration list --linked                        # baseline=applied, pending 없음 확인
supabase link --project-ref cguxpeghdqcqfdhvkmyv        # 평시 링크는 staging으로 복구
```
- `migration repair --status applied` 는 **SQL 실행 없이** `schema_migrations` 에 버전만 기록 → 정확히 원하는 동작.
- **`db push` 를 prod에 baseline으로 돌리지 말 것**(DDL 시도됨). **`db remote commit` 도 쓰지 말 것**(원격에서 새 migration 생성하는 구식 흐름).
- diff가 DDL을 뱉으면 prod와 baseline 불일치 → 마킹 전에 해소.
- 예상되는 정당한 차이 1건: `fcm_notification_webhook` 트리거(레거시, baseline 제외). `drop_legacy_fcm_webhook` 마이그레이션이 prod에 적용되면 소멸.

---

## Phase F — 이후 정상 워크플로우 (두 레포 협업)

```
# 1) [PrayU-Api] 스키마 변경
supabase migration new <name>           # 직접 작성  또는
supabase db diff -f <name>              # 로컬 스튜디오 변경분 자동 추출
# 2) [PrayU-Api] 로컬 검증
supabase db reset
supabase gen types --lang=typescript --local > supabase/functions/_types/database.ts
# 3) [PrayU-Api] staging 반영 후 확인
supabase db push --linked               # 기본 링크 = staging
# 4) [PrayU-web] 타입 동기화
npm run supabase-sync                   # staging 기준 database.ts 재생성 → 프론트 반영
# 5) [PrayU-Api] prod 반영 후 확인
supabase db push --db-url "<prod>"      # prod는 명시적 --db-url 로만
```
- **권장 안전장치**: PrayU-Api 기본 링크는 staging로 두고 **prod 반영은 명시적 `--db-url`**(저장된 percent-encoded 접속문자열, 커밋 금지)로만 → 실수로 prod push 방지.
- CI 확장: PrayU-Api에 이미 함수 배포 워크플로우(staging/prod)가 있으므로 같은 트리거 체계에 `supabase db push` 단계를 추가하는 것이 자연스러움. prod push는 release 트리거 + 수동 승인 게이트, `supabase db diff` 를 체크로.

---

## Phase G — 교차 함정 체크리스트
- **항상 drift 먼저**: baseline 작업 전 staging·prod 양쪽에 `db diff` 로 차이 확인(손으로 동기화해 왔으므로 다르다고 가정).
- **링크≠prod 혼동 금지**, prod 작업은 prod ref/--db-url 명시. 평시 링크는 staging.
- **로컬 스택은 PrayU-Api에서만** (포트 충돌 + 이원화 방지). web에서 `supabase start` 금지.
- **Vercel env 보존**: prod/staging 의 `VITE_SUPA_PROJECT_URL`/`VITE_SUPA_ANON_KEY` 변경 금지. 로컬 값은 web `.env.local` 에만.
- **Kakao callback URL**: 프로젝트 URL/ref 바꾸면 등록된 redirect 무효화 → 변경 금지. (CLAUDE.md상 사람 확인 필요 항목)
- 데이터 덤프 PII 주의, `pgsodium`/`vault` extension 은 `IF NOT EXISTS` 로 재생 안전.

---

## 검증 (Verification)
- **로컬**: PrayU-Api `./scripts/dev.sh` → `supabase db reset` 무오류, `supabase migration list` 에 baseline만 깔끔. web `.env.local` 을 로컬로 바꾸고 `npm run dev` 로 로그인/그룹/기도카드 CRUD/말씀카드 생성(함수 호출)/이미지 업로드 정상. web `npm run lint` + `npm run build` 통과.
- **staging**: 리셋 후 앱 주요 플로우 회귀 확인(로그인, 그룹, 기도카드, 감사카드 공유, 알림, Kakao callback). 버킷/realtime/트리거 동작 확인.
- **prod**: `supabase migration list --linked` 에서 baseline=applied, **DDL 미실행** 확인. `db diff` 비어 있음. 운영 무중단(스키마 변화 없음).
- **이후 워크플로우 1회 리허설**: `20260718084009_drop_legacy_fcm_webhook` 마이그레이션(레거시 webhook 제거)을 로컬→staging→prod로 흘려보며 end-to-end 확인 (web 타입 동기화 포함). 실제 정리 작업을 리허설로 겸용.

## 주요 수정 파일

**PrayU-Api** (백엔드 상태의 주인):
- `supabase/migrations/<stamp>_initial_baseline.sql` (신규 — 마이그레이션 체계의 시작점)
- `supabase/config.toml` (`[storage.buckets.*]` 추가, `[auth]` redirect 확인)
- `.github/workflows/supabase-deploy-{staging,prod}.yaml` (CLI 버전 핀, 추후 db push 단계, prod 워크플로우 name 오타 수정)

**PrayU-web** (소비자로 슬림화):
- `supabase/migrations/20240727_initial_migration.sql` **삭제**
- `supabase/functions/bible/` 빈 stub **삭제**, `supabase/seed.sql` 삭제 가능
- `package.json` (`supabase` devDep 정리, 필요시 `supabase-sync-local` 추가)
- `.env.local` (로컬 스택용 URL/anon key — 커밋 안 함)
