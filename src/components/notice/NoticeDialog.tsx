import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useBaseStore from "@/stores/baseStore";
import { fetchActiveNotice, fetchNoticeById, parseNoticeSlides } from "@/apis/notice";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

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
        where: "notification",
      });
    };

    loadNotice();
    return () => {
      cancelled = true;
    };
  }, [openNoticeId, setOpenNoticeId]);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => setCurrentIndex(api.selectedScrollSnap()));
  }, [api]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (notice) analyticsTrack("클릭_공지_닫기", { notice_id: notice.id });
  }, [notice]);

  const handleHideNextTime = () => {
    if (notice) {
      markNoticeSeen(notice.id);
      analyticsTrack("클릭_공지_다시안보기", { notice_id: notice.id });
    }
    setIsOpen(false);
  };

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

  const slides = parseNoticeSlides(notice.slides);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="w-11/12 rounded-2xl border-none p-0 focus:outline-none">
        <DialogHeader className="p-5 pb-0 text-left">
          <DialogTitle className="text-lg">📢 {notice.title}</DialogTitle>
          <DialogDescription className="sr-only">공지 안내</DialogDescription>
        </DialogHeader>

        {slides.length > 0 && (
          <div className="w-full px-5">
            <hr className="my-3" />
            <Carousel setApi={setApi}>
              <CarouselContent>
                {slides.map((slide, index) => (
                  <CarouselItem key={index}>
                    <div className="flex h-full flex-col items-center gap-4">
                      {slide.image_url && (
                        <img
                          src={slide.image_url}
                          className="w-full rounded-lg shadow-md"
                          alt={slide.tip || notice.title}
                        />
                      )}
                      <div className="w-full space-y-2 text-left">
                        {slide.tip && (
                          <span className="text-sm font-bold">{slide.tip}</span>
                        )}
                        {(slide.description || []).map((line, lineIndex) => (
                          <p key={lineIndex} className="text-sm text-gray-600">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {slides.length > 1 && (
                <>
                  <div className="mt-2 flex items-center justify-center p-4">
                    {slides.map((_, index) => (
                      <span
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={`mx-1 cursor-pointer rounded-full transition-colors duration-300 ${
                          currentIndex === index
                            ? "h-[8px] w-[8px] bg-[#608CFF]"
                            : "h-[6px] w-[6px] bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  <CarouselPrevious className="-left-4 h-6 w-6" />
                  <CarouselNext className="-right-4 h-6 w-6" />
                </>
              )}
            </Carousel>
          </div>
        )}

        {notice.cta_label && notice.cta_url && (
          <div className="px-5 pt-4">
            <button
              onClick={handleClickCta}
              className="h-[48px] w-full rounded-xl bg-[#608CFF] text-base font-medium text-white transition hover:bg-[#4a70e2]"
            >
              {notice.cta_label}
            </button>
          </div>
        )}

        <div className="mt-4 grid w-full grid-cols-2 overflow-hidden border-t border-gray-200">
          <button
            onClick={handleHideNextTime}
            className="rounded-bl-lg p-4 font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            다음에 보지 않기
          </button>
          <button
            onClick={handleClose}
            className="rounded-br-lg p-4 font-medium text-gray-700 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDialog;
