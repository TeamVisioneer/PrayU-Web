import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  createNotice,
  fetchNoticeList,
  parseNoticeSlides,
  updateNotice,
} from "@/apis/notice";
import { Notice, NoticeSlide } from "../../../supabase/types/tables";
import { TablesInsert } from "../../../supabase/types/database";

const emptySlide: NoticeSlide = { image_url: "", tip: "", description: [] };

/**
 * 어드민 공지 관리 — 목록 / 작성 / 수정 / 활성 토글.
 * 쓰기 권한은 notice 테이블 RLS(is_admin)가 강제한다.
 */
const NoticeManager = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [target, setTarget] = useState<"all" | "existing">("all");
  const [endsAt, setEndsAt] = useState("");
  const [slides, setSlides] = useState<NoticeSlide[]>([{ ...emptySlide }]);

  const loadNotices = useCallback(async () => {
    setIsLoading(true);
    const list = await fetchNoticeList();
    setIsLoading(false);
    if (!list) {
      toast({ description: "공지 목록을 불러오지 못했어요" });
      return;
    }
    setNotices(list);
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setCtaLabel("");
    setCtaUrl("");
    setTarget("all");
    setEndsAt("");
    setSlides([{ ...emptySlide }]);
  };

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setCtaLabel(notice.cta_label || "");
    setCtaUrl(notice.cta_url || "");
    setTarget(notice.target === "existing" ? "existing" : "all");
    setEndsAt(notice.ends_at ? notice.ends_at.slice(0, 16) : "");
    const parsed = parseNoticeSlides(notice.slides);
    setSlides(parsed.length > 0 ? parsed : [{ ...emptySlide }]);
  };

  const updateSlide = (index: number, patch: Partial<NoticeSlide>) => {
    setSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ description: "제목을 입력해 주세요" });
      return;
    }
    // 빈 슬라이드는 저장하지 않는다
    const cleanedSlides = slides.filter(
      (slide) =>
        slide.image_url?.trim() ||
        slide.tip?.trim() ||
        (slide.description || []).length > 0,
    );

    const payload = {
      title: title.trim(),
      // NoticeSlide는 앱에서 정의한 형태 — 컬럼은 jsonb라 Json으로 넘긴다
      slides: cleanedSlides as unknown as TablesInsert<"notice">["slides"],
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      target,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    };

    const saved = editingId
      ? await updateNotice(editingId, payload)
      : await createNotice(payload);

    if (!saved) {
      toast({ description: "저장에 실패했어요" });
      return;
    }
    toast({ description: editingId ? "공지를 수정했어요" : "공지를 만들었어요" });
    resetForm();
    loadNotices();
  };

  const handleToggleActive = async (notice: Notice) => {
    const saved = await updateNotice(notice.id, {
      is_active: !notice.is_active,
    });
    if (!saved) {
      toast({ description: "상태 변경에 실패했어요" });
      return;
    }
    loadNotices();
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {editingId ? "공지 수정" : "새 공지 작성"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (예: 새로워진 말씀카드)"
          />
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="CTA 문구 (예: 말씀카드 만들러 가기)"
            />
            <Input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="CTA 이동 경로 (예: /bible-card/new)"
            />
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={target}
              onChange={(e) =>
                setTarget(e.target.value === "existing" ? "existing" : "all")
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">전체 사용자</option>
              <option value="existing">기존 사용자만 (신규 가입자 제외)</option>
            </select>
            <div className="flex flex-1 items-center gap-2">
              <span className="shrink-0 text-sm text-gray-500">종료일시</span>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-md border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  슬라이드 {index + 1}
                </span>
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    삭제
                  </button>
                )}
              </div>
              <Input
                value={slide.image_url || ""}
                onChange={(e) => updateSlide(index, { image_url: e.target.value })}
                placeholder="이미지 경로 (예: /images/notice/bible_card.png)"
              />
              <Input
                value={slide.tip || ""}
                onChange={(e) => updateSlide(index, { tip: e.target.value })}
                placeholder="소제목 (예: 이렇게 달라졌어요)"
              />
              <textarea
                value={(slide.description || []).join("\n")}
                onChange={(e) =>
                  updateSlide(index, {
                    description: e.target.value
                      .split("\n")
                      .filter((line) => line.trim().length > 0),
                  })
                }
                placeholder="본문 — 줄바꿈으로 구분"
                className="min-h-20 rounded-md border border-input bg-background p-3 text-sm"
              />
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              variant="primaryLight"
              onClick={() => setSlides((prev) => [...prev, { ...emptySlide }])}
            >
              슬라이드 추가
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? "수정 저장" : "공지 만들기"}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={resetForm}>
                취소
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            공지 목록 {isLoading && "(불러오는 중...)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {notices.length === 0 && !isLoading && (
            <div className="py-6 text-center text-sm text-gray-500">
              등록된 공지가 없습니다.
            </div>
          )}
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {notice.title}
                  </span>
                  <Badge
                    className={
                      notice.is_active ? "bg-blue-500" : "bg-gray-400"
                    }
                  >
                    {notice.is_active ? "노출중" : "중지"}
                  </Badge>
                  {notice.target === "existing" && (
                    <Badge className="bg-gray-500">기존 사용자</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {notice.starts_at.slice(0, 10)}
                  {notice.ends_at ? ` ~ ${notice.ends_at.slice(0, 10)}` : " ~"}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => startEdit(notice)}>
                  수정
                </Button>
                <Button
                  variant="primaryLight"
                  onClick={() => handleToggleActive(notice)}
                >
                  {notice.is_active ? "중지" : "노출"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticeManager;
