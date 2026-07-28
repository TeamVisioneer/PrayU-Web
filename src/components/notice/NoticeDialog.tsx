import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBaseStore from "@/stores/baseStore";
import { fetchActiveNotice, fetchNoticeById, parseNoticeImages } from "@/apis/notice";
import NoticeContent from "./NoticeContent";
import { analyticsTrack } from "@/analytics/analytics";
import { Notice } from "../../../supabase/types/tables";

const SEEN_NOTICE_STORAGE_KEY = "seenNoticeIds";

const readSeenNoticeIds = (): string[] => {
  try {
    const raw = localStorage.getItem(SEEN_NOTICE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const markNoticeSeen = (noticeId: string) => {
  try {
    const seen = readSeenNoticeIds();
    if (seen.includes(noticeId)) return;
    localStorage.setItem(
      SEEN_NOTICE_STORAGE_KEY,
      JSON.stringify([...seen, noticeId].slice(-50)),
    );
  } catch {
    // 저장 실패는 무시 — 다음 진입 때 다시 뜨는 정도의 영향
  }
};

/**
 * 공지 모달 — 앱 전역에 상시 마운트된다.
 *
 * 두 경로로 열린다.
 *  1) 자동 노출: 로그인 사용자에게 활성 공지 1건을 "다음에 보지 않기" 전까지 노출
 *  2) 알림함: 공지 알림 클릭 시 store의 openNoticeId로 해당 공지를 연다
 */
const NoticeDialog = () => {
  const navigate = useNavigate();
  const user = useBaseStore((state) => state.user);
  const myProfile = useBaseStore((state) => state.myProfile);
  const openNoticeId = useBaseStore((state) => state.openNoticeId);
  const setOpenNoticeId = useBaseStore((state) => state.setOpenNoticeId);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 자동 노출: 활성 공지 조회 → 이미 본 공지·대상 조건 확인
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadActiveNotice = async () => {
      const activeNotice = await fetchActiveNotice();
      if (cancelled || !activeNotice) return;
      if (readSeenNoticeIds().includes(activeNotice.id)) return;

      // target='existing': 공지 시작 전 가입자에게만 (신규 가입자는 온보딩과 겹쳐 제외)
      if (activeNotice.target === "existing") {
        const joinedAt = myProfile?.created_at;
        if (!joinedAt || new Date(joinedAt) >= new Date(activeNotice.starts_at))
          return;
      }

      setNotice(activeNotice);
      setIsOpen(true);
      analyticsTrack("노출_공지", { notice_id: activeNotice.id, where: "auto" });
    };

    loadActiveNotice();
    return () => {
      cancelled = true;
    };
  }, [user, myProfile?.created_at]);

  // 알림함에서 특정 공지 열기 (기간이 지난 공지는 RLS에 막혀 null → 열지 않음)
  useEffect(() => {
    if (!openNoticeId) return;
    let cancelled = false;

    const loadNotice = async () => {
      const target = await fetchNoticeById(openNoticeId);
      setOpenNoticeId(null);
      if (cancelled || !target) return;
      setNotice(target);
      setIsOpen(true);
      analyticsTrack("노출_공지", {
        notice_id: target.id,
        where: "selected",
      });
    };

    loadNotice();
    return () => {
      cancelled = true;
    };
  }, [openNoticeId, setOpenNoticeId]);

  // 닫으면 본 것으로 처리한다 — 다시 보고 싶으면 메뉴 > 공지사항에서 열 수 있다
  const handleClose = useCallback(() => {
    if (notice) {
      markNoticeSeen(notice.id);
      analyticsTrack("클릭_공지_닫기", { notice_id: notice.id });
    }
    setIsOpen(false);
  }, [notice]);

  const handleClickCta = () => {
    if (!notice?.cta_url) return;
    // 안내를 본 뒤 다시 뜨지 않도록 — CTA를 눌렀다면 이미 확인한 공지
    markNoticeSeen(notice.id);
    analyticsTrack("클릭_공지_CTA", {
      notice_id: notice.id,
      cta_url: notice.cta_url,
    });
    setIsOpen(false);
    if (notice.cta_url.startsWith("http")) {
      window.location.href = notice.cta_url;
    } else {
      navigate(notice.cta_url);
    }
  };

  if (!notice) return null;

  const images = parseNoticeImages(notice.images);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      {/* 카드 자체는 아래 div가 그린다 — DialogContent는 투명 래퍼.
          보조 액션은 카드 밖(dim)으로 빼서 CTA만 카드 안 주 액션으로 남긴다 */}
      <DialogContent
        showCloseButton={false}
        className="w-11/12 border-none bg-transparent p-0 shadow-none focus:outline-none"
      >
        {/* 공지 길이는 원고마다 다르다 — 카드가 화면을 넘지 않도록 상한을 두고,
            넘치면 카드 안에서 스크롤한다. 상한이 없으면 제목과 CTA 가 화면 밖으로 잘린다 */}
        <div className="relative flex max-h-[85dvh] w-full flex-col overflow-y-auto rounded-2xl bg-background pb-5">
          <DialogHeader className="p-5 pb-0 pr-12 text-left">
            <DialogTitle className="text-lg">📢 {notice.title}</DialogTitle>
            <DialogDescription className="sr-only">공지 안내</DialogDescription>
          </DialogHeader>
          {/* 카드 안 닫기 — DialogContent가 투명해져 기본 X를 끄고 카드에 직접 붙인다 */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-5 text-gray-400 transition hover:text-gray-600"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>

          <NoticeContent
            images={images}
            body={notice.body}
            ctaLabel={notice.cta_label}
            ctaUrl={notice.cta_url}
            onClickCta={handleClickCta}
          />
        </div>

        {/* dim 위 닫기 — 앱의 다른 모달(ExternalLinkDialog)과 같은 흰 원형 버튼 */}
        <button
          onClick={handleClose}
          className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100"
          aria-label="닫기"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDialog;
