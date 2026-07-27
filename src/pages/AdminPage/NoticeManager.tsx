import { useCallback, useEffect, useState } from "react";
import { Eye, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import NoticeContent from "@/components/notice/NoticeContent";
import { getPublicUrl, uploadImage } from "@/apis/file";
import {
  createNotice,
  fetchNoticeList,
  parseNoticeSlides,
  updateNotice,
} from "@/apis/notice";
import { Notice, NoticeSlide } from "../../../supabase/types/tables";
import { TablesInsert } from "../../../supabase/types/database";

const emptySlide = (): NoticeSlide => ({
  image_url: "",
  tip: "",
  body: "",
});

interface NoticeForm {
  title: string;
  ctaLabel: string;
  ctaUrl: string;
  target: "all" | "existing";
  endsAt: string;
  slides: NoticeSlide[];
}

const emptyForm = (): NoticeForm => ({
  title: "",
  ctaLabel: "",
  ctaUrl: "",
  target: "all",
  endsAt: "",
  slides: [emptySlide()],
});

const noticeStatus = (notice: Notice) => {
  if (!notice.is_active) return { label: "중지", className: "bg-gray-400" };
  const now = Date.now();
  if (new Date(notice.starts_at).getTime() > now) {
    return { label: "예약", className: "bg-amber-500" };
  }
  if (notice.ends_at && new Date(notice.ends_at).getTime() <= now) {
    return { label: "종료", className: "bg-gray-400" };
  }
  return { label: "노출중", className: "bg-blue-500" };
};

/**
 * 어드민 공지 관리 — 목록이 기본 화면이고, 작성·수정은 모달에서 한다.
 * 쓰기 권한은 notice 테이블 RLS(is_admin)가 강제한다.
 */
const NoticeManager = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoticeForm>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

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

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsPreview(false);
    setIsEditorOpen(true);
  };

  const openEdit = (notice: Notice) => {
    // 이전 형식(description 줄 배열)로 저장된 공지는 마크다운 본문으로 옮겨 편집한다
    const slides = parseNoticeSlides(notice.slides).map((slide) =>
      slide.body === undefined && slide.description
        ? { ...slide, body: slide.description.join("\n") }
        : slide,
    );
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      ctaLabel: notice.cta_label || "",
      ctaUrl: notice.cta_url || "",
      target: notice.target === "existing" ? "existing" : "all",
      endsAt: notice.ends_at ? notice.ends_at.slice(0, 16) : "",
      slides: slides.length > 0 ? slides : [emptySlide()],
    });
    setIsPreview(false);
    setIsEditorOpen(true);
  };

  const patchSlide = (index: number, patch: Partial<NoticeSlide>) => {
    setForm((prev) => ({
      ...prev,
      slides: prev.slides.map((slide, i) =>
        i === index ? { ...slide, ...patch } : slide,
      ),
    }));
  };

  /** 공지 이미지 업로드 — 기존 prayu 버킷의 notice/ 경로를 쓴다 */
  const handleUploadImage = async (index: number, file: File) => {
    setUploadingIndex(index);
    const safeName = file.name.replace(/[^\w.-]/g, "_");
    const path = `notice/${Date.now()}-${safeName}`;
    const uploaded = await uploadImage(file, path);
    if (!uploaded) {
      setUploadingIndex(null);
      toast({ description: "이미지 업로드에 실패했어요" });
      return;
    }
    const publicUrl = getPublicUrl(uploaded.path);
    setUploadingIndex(null);
    if (!publicUrl) {
      toast({ description: "이미지 주소를 가져오지 못했어요" });
      return;
    }
    patchSlide(index, { image_url: publicUrl });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ description: "제목을 입력해 주세요" });
      return;
    }
    const cleanedSlides = form.slides.filter(
      (slide) => slide.image_url?.trim() || slide.tip?.trim() || slide.body?.trim(),
    );

    setIsSaving(true);
    const payload = {
      title: form.title.trim(),
      // NoticeSlide는 앱에서 정의한 형태 — 컬럼은 jsonb라 Json으로 넘긴다
      slides: cleanedSlides as unknown as TablesInsert<"notice">["slides"],
      cta_label: form.ctaLabel.trim() || null,
      cta_url: form.ctaUrl.trim() || null,
      target: form.target,
      ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };
    const saved = editingId
      ? await updateNotice(editingId, payload)
      : await createNotice(payload);
    setIsSaving(false);

    if (!saved) {
      toast({ description: "저장에 실패했어요" });
      return;
    }
    toast({
      description: editingId ? "공지를 수정했어요" : "공지를 만들었어요",
    });
    setIsEditorOpen(false);
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
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {isLoading ? "불러오는 중..." : `공지 ${notices.length}개`}
        </span>
        <Button
          variant="primary"
          onClick={openCreate}
          className="flex h-9 items-center gap-1 px-3 text-sm"
        >
          <Plus className="h-4 w-4" />새 공지
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {!isLoading && notices.length === 0 && (
          <div className="rounded-xl bg-white py-10 text-center text-sm text-gray-500">
            등록된 공지가 없어요. 새 공지를 만들어 보세요.
          </div>
        )}
        {notices.map((notice) => {
          const status = noticeStatus(notice);
          const slideCount = parseNoticeSlides(notice.slides).length;
          return (
            <div
              key={notice.id}
              className="flex flex-col gap-2 rounded-xl bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className={status.className}>{status.label}</Badge>
                    {notice.target === "existing" && (
                      <Badge className="bg-gray-500">기존 사용자</Badge>
                    )}
                  </div>
                  <div className="mt-1.5 truncate text-sm font-semibold">
                    {notice.title}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {notice.starts_at.slice(0, 10)}
                    {notice.ends_at
                      ? ` ~ ${notice.ends_at.slice(0, 10)}`
                      : " ~ 무기한"}
                    {` · 슬라이드 ${slideCount}장`}
                    {notice.cta_label ? ` · CTA "${notice.cta_label}"` : ""}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="h-8 flex-1 text-sm"
                  onClick={() => openEdit(notice)}
                >
                  수정
                </Button>
                <Button
                  variant="primaryLight"
                  className="h-8 flex-1 text-sm"
                  onClick={() => handleToggleActive(notice)}
                >
                  {notice.is_active ? "중지" : "노출"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-h-[85vh] w-11/12 overflow-y-auto rounded-xl">
          <DialogHeader>
            {/* pr-8: 우상단 닫기(X) 버튼과 겹치지 않게 */}
            <div className="flex items-center justify-between gap-2 pr-8">
              <DialogTitle>{editingId ? "공지 수정" : "새 공지"}</DialogTitle>
              <button
                type="button"
                onClick={() => setIsPreview((prev) => !prev)}
                className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
              >
                {isPreview ? (
                  <>
                    <Pencil className="h-3.5 w-3.5" />
                    편집
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    미리보기
                  </>
                )}
              </button>
            </div>
            <DialogDescription className="text-xs">
              {isPreview
                ? "사용자에게 보이는 그대로입니다."
                : "슬라이드는 앱 공지 모달에 순서대로 노출됩니다."}
            </DialogDescription>
          </DialogHeader>

          {isPreview ? (
            // 실제 공지 모달과 같은 구성(어두운 배경 · 카드 · 카드 밖 보조 액션)으로 그린다
            <div className="rounded-xl bg-gray-800 p-4">
              <div className="w-full rounded-2xl bg-white pb-5">
                <div className="px-5 pt-5 text-lg font-semibold">
                  📢 {form.title || "(제목 없음)"}
                </div>
                <NoticeContent
                  title={form.title}
                  slides={form.slides.filter(
                    (slide) =>
                      slide.image_url?.trim() ||
                      slide.tip?.trim() ||
                      slide.body?.trim(),
                  )}
                  ctaLabel={form.ctaLabel || null}
                  ctaUrl={form.ctaUrl || null}
                />
              </div>
              <div className="flex items-center justify-between px-1 pt-1 text-sm text-white/70">
                <span className="px-3 py-2">다음에 보지 않기</span>
                <span className="px-3 py-2">닫기</span>
              </div>
            </div>
          ) : (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">제목</span>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="예: 새로워진 말씀카드"
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">
                버튼 (선택)
              </span>
              <Input
                value={form.ctaLabel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))
                }
                placeholder="버튼 문구 — 예: 말씀카드 만들러 가기"
              />
              <Input
                value={form.ctaUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ctaUrl: e.target.value }))
                }
                placeholder="이동 링크 — 예: /bible-card/new"
              />
              <span className="text-[11px] text-gray-400">
                둘 다 입력해야 버튼이 노출됩니다. 앱 내 이동은 /로 시작하는 경로,
                외부는 https:// 주소를 넣으세요.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">
                노출 대상 · 종료일시
              </span>
              <Select
                value={form.target}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    target: value === "existing" ? "existing" : "all",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 사용자</SelectItem>
                  <SelectItem value="existing">
                    기존 사용자만 (신규 가입자 제외)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endsAt: e.target.value }))
                }
              />
              <span className="text-[11px] text-gray-400">
                비워두면 중지할 때까지 계속 노출됩니다.
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-600">슬라이드</span>
              {form.slides.map((slide, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      {index + 1}번째
                    </span>
                    {form.slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            slides: prev.slides.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-gray-400 hover:text-red-500"
                        aria-label="슬라이드 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {slide.image_url ? (
                    <div className="relative">
                      <img
                        src={slide.image_url}
                        alt="슬라이드 이미지"
                        className="max-h-40 w-full rounded-md object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => patchSlide(index, { image_url: "" })}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                        aria-label="이미지 제거"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 py-6 text-xs text-gray-500 hover:bg-gray-50">
                      {uploadingIndex === index ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          업로드 중...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-5 w-5" />
                          이미지 올리기
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingIndex !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImage(index, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                  <Input
                    value={slide.tip || ""}
                    onChange={(e) => patchSlide(index, { tip: e.target.value })}
                    placeholder="소제목 — 예: 이렇게 달라졌어요"
                  />
                  <textarea
                    value={slide.body || ""}
                    onChange={(e) => patchSlide(index, { body: e.target.value })}
                    placeholder={"본문 (마크다운)\n\n**굵게**\n- 항목\n- 항목\n\n빈 줄로 문단을 나눕니다"}
                    className="min-h-32 rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed"
                  />
                  <span className="text-[11px] text-gray-400">
                    <code>**굵게**</code> · <code>- 항목</code> · 빈 줄로 문단 구분
                  </span>
                </div>
              ))}
              <Button
                variant="secondary"
                className="h-9 text-sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    slides: [...prev.slides, emptySlide()],
                  }))
                }
              >
                슬라이드 추가
              </Button>
            </div>
          </div>
          )}

          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsEditorOpen(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "저장 중..." : editingId ? "수정 저장" : "만들기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoticeManager;
