#!/usr/bin/env bash
#
# 릴리스 버전 범프 헬퍼.
# package.json 버전을 올리고 "chore: release vX.Y.Z" 커밋만 만든다.
# 태그 생성/배포는 하지 않는다 — 배포는 GitHub Release 발행으로(= prod 트리거).
# 이렇게 하면 태그가 가리키는(=배포되는) 커밋이 자기 버전을 그대로 갖는다.
#
# 사용:
#   scripts/release.sh minor        # 정식 배포: X.Y.0
#   scripts/release.sh patch        # 핫픽스:   X.Y.(Z+1)
#   scripts/release.sh 1.2.3        # 명시 버전
#
set -euo pipefail

bump="${1:-}"
if [ -z "$bump" ]; then
  echo "사용: scripts/release.sh <minor|patch|major|X.Y.Z>" >&2
  exit 1
fi

# 작업 트리가 깨끗해야 한다(범프 커밋에 다른 변경이 섞이지 않도록)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "✗ 작업 트리가 깨끗하지 않습니다. 변경을 먼저 커밋/정리하세요." >&2
  exit 1
fi

# package.json/package-lock 버전만 갱신(git 태그·커밋은 만들지 않음)
new="$(npm version "$bump" --no-git-tag-version)"   # 예: v0.15.2 출력
git add package.json package-lock.json 2>/dev/null || git add package.json
git commit -m "chore: release ${new}"

cat <<MSG
✓ ${new} 로 범프 + 커밋 완료.

다음 단계:
  정식) 이 커밋을 PR → main 머지 → GitHub Release ${new} 발행(target = 머지 커밋)
  핫픽스) git push origin <hotfix 브랜치> → GitHub Release ${new} 발행(target = 이 커밋)
          → 이후 main 으로 포워드포트(버전 충돌은 main 값 유지)
Release 발행이 prod 배포를 트리거합니다. 상세: docs/guides/deployment-runbook.md
MSG
