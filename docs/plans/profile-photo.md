# 프로필 사진 변경

> 상태: **승인·구현** (2026-08-18) · 짝 PR: [PrayU-Api#61](https://github.com/TeamVisioneer/PrayU-Api/pull/61) (upload-url KINDS 에 `avatar`)
> merge 순서: **Api 먼저 → web** — 뒤집히면 web 이 `kind: "avatar"` 로 400

## 결정

1. **절대 URL 저장** — R2 key 를 `assetUrl(key)` 로 조립해 `profiles.avatar_url` 에 저장.
   렌더 7곳이 전부 절대 URL 을 가정하고 카카오 URL 과 혼재하므로 무수정 호환 (공지 이미지와 같은 예외 선례).
   마이그레이션 불필요 — 컬럼 권한·RLS 이미 허용, `avatar_url_https_trigger` 는 INSERT 전용.
   ⚠️ 스토리지 도메인 변경 시 avatar_url 은 일괄 UPDATE(prefix 치환) 필요 — key-only 원칙의 의도적 예외
2. **진입점 = 내 프로필 히어로 아바타 탭** (카메라 뱃지 어포던스)
3. **512px 단일 사용본, 원본 미보관** — 표시 최대 80px 라 레티나 3x 여유.
   규모 확장 시 저장 구조 변경 없이 Cloudflare Image Resizing 으로 파생 가능. 정사각 크롭 UI 는 v2 후보
4. **삭제(기본 이미지로 되돌리기)는 범위 밖** — `LoginRedirect` 가 avatar_url 이 비면
   카카오 사진을 재주입하는 코드와 충돌한다. 함께 묶어 후속

## 구현

| 파일 | 내용 |
|---|---|
| Api `uploadController.ts` | `KINDS` 에 `"avatar"` — key 는 서버가 `avatar/{uuid}.{ext}` 생성 (#61) |
| `src/apis/file.ts` | `UploadKind`·`LEGACY_DIRS` 에 avatar 추가 |
| `src/components/profile/AvatarUploader.tsx` (신규) | 히어로 아바타 + 변경 플로우: 탭 → 숨긴 file input → `resizeImageFile(512)` → `uploadImage("avatar")` → `uploaded.url ?? assetUrl(key)` → `updateProfile` → `getProfile` → toast. 업로드 중 디밍+스피너·disabled, 실패 단계별 토스트, onError 기본 이미지 폴백(기존 히어로에 없던 것) |
| `src/pages/MyProfilePage.tsx` | 히어로 `<img>` → `<AvatarUploader />` |

analytics 이벤트 1건 신설: `클릭_내프로필_사진변경` (계획 승인에 포함)

## 후속 (backlog)

- 아바타 재변경 시 옛 R2 파일 orphan — Api backlog 등재 (용량 문제 시 착수)
- 기본 이미지로 되돌리기 + LoginRedirect 재주입 조건 수정
