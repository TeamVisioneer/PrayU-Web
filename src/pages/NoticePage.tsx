import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { fetchPublicNoticeList } from "@/apis/notice";
import useBaseStore from "@/stores/baseStore";
import { analyticsTrack } from "@/analytics/analytics";
import { Notice } from "../../supabase/types/tables";

/**
 * 공지사항 목록.
 * 상세 화면은 따로 두지 않는다 — 항목을 누르면 앱 전역의 공지 모달(NoticeDialog)이
 * 열린다. 알림함에서 공지를 여는 경로와 같은 방식이다.
 */
const NoticePage = () => {
  const setOpenNoticeId = useBaseStore((state) => state.setOpenNoticeId);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublicNoticeList().then((list) => {
      if (cancelled) return;
      setNotices(list);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onClickNotice = (notice: Notice) => {
    analyticsTrack("클릭_공지사항_상세", { notice_id: notice.id });
    setOpenNoticeId(notice.id);
  };

  return (
    <div className="flex h-full w-full flex-col bg-mainBg">
      <PageHeader title="공지사항" />

      <main className="flex-1 overflow-y-auto px-5 py-4">
        {isLoading && (
          <div className="py-16 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        )}

        {!isLoading && (!notices || notices.length === 0) && (
          <div className="py-16 text-center text-sm text-gray-500">
            아직 등록된 공지사항이 없어요.
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {(notices || []).map((notice) => (
            <li key={notice.id}>
              <button
                type="button"
                onClick={() => onClickNotice(notice)}
                className="flex w-full flex-col items-start gap-1 rounded-xl bg-white px-4 py-3.5 text-left transition active:scale-[0.99]"
              >
                <span className="line-clamp-2 text-sm font-medium text-gray-900">
                  {notice.title}
                </span>
                <span className="text-xs text-gray-400">
                  {notice.starts_at.slice(0, 10).replace(/-/g, ".")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default NoticePage;
