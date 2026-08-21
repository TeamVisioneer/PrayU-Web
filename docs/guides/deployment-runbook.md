# 배포·핫픽스 런북 (web)

> 갱신: 2026-08-21 · 절차 대장(guides/) — 계속 갱신
> CI: `.github/workflows/deploy_prod.yaml`

## 모델 — "최신 Release 태그 = 현재 prod"

- **staging** = `main` merge 시 자동 배포
- **prod** = **GitHub Release 발행(태그)로만** 배포. 정식이든 hotfix든 **모든 prod 배포는 Release 태그를 남긴다.** 그래서 **"가장 최신 Release = 현재 prod"** 가 항상 성립한다(더는 태그/라인 이탈 없음).
- `main` 은 미출시 작업(예: v1.0.0)을 계속 쌓아도 무방 — prod 와 분리돼 있다.

> 🔴 **하지 말 것**: `v*` 브랜치 push 나 `hotfix:` 제목 PR 로 prod 배포 금지(제거됨). prod 로 나가는 유일한 길은 **Release 발행**이다.

## 정식 배포 (minor)

1. `main` 에서 릴리스 준비가 끝나면 **버전 범프 커밋**을 만든다(태그 커밋이 자기 버전을 갖도록):
   ```bash
   scripts/release.sh minor    # package.json → X.Y.0 갱신 + "chore: release vX.Y.0" 커밋
   ```
   PR 로 리뷰 → `main` 머지.
2. 머지된 그 커밋을 target 으로 GitHub → Releases → 태그 `vX.Y.0` → 노트 작성 → **Publish**.
3. `Production Tag Deployment` 워크플로우 자동 실행 → Vercel prod 배포.
4. 크로스 레포: 스키마/함수 의존이 있으면 **Api 먼저 release → web** 순서.

> **버전 범프는 왜 CI 자동이 아닌가**: 릴리스 후 CI 가 `npm version` 하고 main 에 push 하면 (1) **태그된 커밋엔 옛 버전이 남고**(범프가 태그 뒤에 붙음) (2) 실제 릴리스 버전과 드리프트 (3) CI 가 main 에 직접 push(브랜치보호·토큰·staging 재배포). 그래서 범프를 **릴리스 커밋 안**에 둔다.

## 핫픽스 (patch)

```bash
# 1) 항상 "최신 Release 태그"(= 현재 prod)에서 분기
git fetch --tags
git checkout -b hotfix/<주제> vX.Y.Z        # vX.Y.Z = 최신 Release 태그

# 2) 수정 커밋 (최소 변경) 후 버전 범프
scripts/release.sh patch                    # package.json → X.Y.(Z+1) + release 커밋

# 3) push + 리뷰
git push origin hotfix/<주제>
gh pr create --title "fix: ..." --body "..."

# 4) patch Release 발행 → prod 배포
#    GitHub Releases → 태그 vX.Y.(Z+1), target = 핫픽스 커밋 → Publish
```

- **포워드포트 필수**: 핫픽스 수정을 **`main` 에도 반영**(cherry-pick 또는 merge). 안 하면 다음 정식 릴리스에서 수정이 사라진다.
- 핫픽스 커밋을 어디에 두든(별도 브랜치) **배포는 그 커밋을 target 으로 한 Release 발행**으로 한다.

## 이중 배포 방지

`deploy_prod.yaml` 에 `concurrency: { group: production-deploy, cancel-in-progress: true }` — 같은 prod 배포가 중복/연속 트리거되면 이전 실행이 취소된다(2026-08 이중 배포 재발 방지).

## 최초 베이스라인 (이 모델 도입 시 1회)

현재 live prod 커밋(`b9f68e4`, 카카오 수정 포함)에는 대응 Release 가 없다. 도입 직후 **그 커밋을 target 으로 `v0.15.2` Release 를 발행**해 "최신 Release = 현재 prod" 를 성립시킨다(같은 커밋 재배포라 멱등).

## Vercel 설정 확인 (사람)

- Vercel **Git 통합이 브랜치 push 로 prod 를 자동배포하지 않는지** 확인(안 그러면 GH Action 과 이중 배포). prod 배포는 GH Action(`vercel deploy --prod`) 경로로만.
- Vercel Production Branch 설정이 이 모델과 충돌하지 않는지 점검.

## 관련

- 배포 모델 개념·과거 사고: 워크스페이스 메모리 `deployment-model`
- 카카오 로그인 수정 경위: [../plans/kakao-oauth-migration.md](../plans/kakao-oauth-migration.md)
