import { useCallback, useEffect, useState, useRef } from "react";
import { Eye, FileDown, ImagePlus, Link2, Loader2, Pencil, Plus, RotateCcw, X } from "lucide-react";
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
import { NoticeDraftFile, loadNoticeDrafts } from "@/lib/noticeDrafts";
import {
  createNotice,
  fetchNoticeList,
  parseNoticeImages,
  updateNotice,
} from "@/apis/notice";
import { Notice } from "../../../supabase/types/tables";
import { TablesInsert } from "../../../supabase/types/database";

interface NoticeForm {
  title: string;
  body: string;
  images: string[];
  ctaLabel: string;
  ctaUrl: string;
  target: "all" | "existing";
  startsAt: string;
  endsAt: string;
}

const emptyForm = (): NoticeForm => ({
  title: "",
  body: "",
  images: [],
  ctaLabel: "",
  ctaUrl: "",
  target: "all",
  startsAt: "",
  endsAt: "",
});

/**
 * 날짜 인풋은 값을 담을 만큼만 차지하게 한다.
 * 기본 Input(h-10·폭 100%)에 네이티브 datetime-local 을 넣으면
 * "연도. 월. 일. -- --:--" 자리표시자와 달력 아이콘 사이가 크게 벌어져 답답해 보인다.
 */
const DATE_INPUT_CLASS = "h-9 w-auto max-w-[15rem] px-2.5 text-xs";

/** ISO → datetime-local 입력값(YYYY-MM-DDTHH:mm). 로컬 시간 기준으로 맞춘다 */
const toLocalInputValue = (iso: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

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
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [draftFiles, setDraftFiles] = useState<NoticeDraftFile[]>([]);
  const [registeringSlug, setRegisteringSlug] = useState<string | null>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    loadNoticeDrafts().then(setDraftFiles);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsPreview(false);
    setIsEditorOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      body: notice.body || "",
      images: parseNoticeImages(notice.images),
      ctaLabel: notice.cta_label || "",
      ctaUrl: notice.cta_url || "",
      target: notice.target === "existing" ? "existing" : "all",
      startsAt: toLocalInputValue(notice.starts_at),
      endsAt: toLocalInputValue(notice.ends_at),
    });
    setIsPreview(false);
    setIsEditorOpen(true);
  };

  /** 레포에 커밋한 이미지 경로(/images/notice/...)를 그대로 넣는다 — 기본 입력 수단 */
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (form.images.includes(url)) {
      toast({ description: "이미 추가된 이미지예요" });
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    setImageUrlInput("");
  };

  /** 원고 → 저장 payload. 등록과 덮어쓰기가 같은 값을 쓰도록 한 곳에 둔다 */
  const draftToPayload = (file: NoticeDraftFile) => {
    const { draft } = file;
    return {
      slug: file.slug,
      title: draft.title as string,
      body: draft.body || null,
      images: (draft.images ?? []) as unknown as TablesInsert<"notice">["images"],
      cta_label: draft.ctaLabel || null,
      cta_url: draft.ctaUrl || null,
      target: draft.target ?? "all",
      ends_at: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
      ...(draft.startsAt
        ? { starts_at: new Date(draft.startsAt).toISOString() }
        : {}),
    };
  };

  /**
   * 레포 원고를 **초안**(비활성)으로 등록한다.
   * 노출은 별도로 사람이 누른다 — 등록만으로 사용자에게 나가지 않게 한다.
   */
  const handleRegisterDraft = async (file: NoticeDraftFile) => {
    if (!file.draft.title) {
      toast({ description: "원고에 제목(title)이 없어 등록할 수 없어요" });
      return;
    }

    setRegisteringSlug(file.slug);
    const saved = await createNotice({
      ...draftToPayload(file),
      // 초안이므로 꺼진 상태로 만든다
      is_active: false,
    });
    setRegisteringSlug(null);

    if (!saved) {
      toast({ description: "등록에 실패했어요" });
      return;
    }
    await loadNotices();
    toast({ description: "초안으로 등록했어요. 확인 후 노출해 주세요" });
  };

  /**
   * 이미 등록된 공지를 원고 내용으로 덮어쓴다.
   * 원고를 고친 뒤 반영할 길이 필요하다 — slug 가 unique 라 다시 등록할 수는 없다.
   * 노출 상태(is_active)는 건드리지 않는다. 내용만 맞추고 게시 여부는 사람이 쥔다.
   */
  const handleSyncDraft = async (file: NoticeDraftFile, notice: Notice) => {
    if (!file.draft.title) {
      toast({ description: "원고에 제목(title)이 없어 불러올 수 없어요" });
      return;
    }

    setRegisteringSlug(file.slug);
    const saved = await updateNotice(notice.id, draftToPayload(file));
    setRegisteringSlug(null);

    if (!saved) {
      toast({ description: "불러오기에 실패했어요" });
      return;
    }
    await loadNotices();
    toast({
      description: notice.is_active
        ? "원고 내용으로 덮어썼어요. 노출 중이니 바로 반영됩니다"
        : "원고 내용으로 덮어썼어요",
    });
  };

  /** 공지 이미지 업로드 — 기존 prayu 버킷의 notice/ 경로를 쓴다 */
  const handleUploadImages = async (files: FileList) => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^\w.-]/g, "_");
      const uploaded = await uploadImage(
        file,
        `notice/${Date.now()}-${safeName}`,
      );
      if (!uploaded) continue;
      const publicUrl = getPublicUrl(uploaded.path);
      if (publicUrl) uploadedUrls.push(publicUrl);
    }
    setIsUploading(false);

    if (uploadedUrls.length === 0) {
      toast({ description: "이미지 업로드에 실패했어요" });
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ description: "제목을 입력해 주세요" });
      return;
    }

    setIsSaving(true);
    const payload = {
      title: form.title.trim(),
      body: form.body.trim() || null,
      // 컬럼은 jsonb라 URL 배열을 Json으로 넘긴다
      images: form.images as unknown as TablesInsert<"notice">["images"],
      cta_label: form.ctaLabel.trim() || null,
      cta_url: form.ctaUrl.trim() || null,
      target: form.target,
      ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      // 시작일시를 비우면: 새 공지는 지금부터(DB default), 수정은 기존 값 유지
      ...(form.startsAt
        ? { starts_at: new Date(form.startsAt).toISOString() }
        : {}),
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

  const registeredBySlug = new Map(
    notices
      .filter((notice): notice is Notice & { slug: string } => !!notice.slug)
      .map((notice) => [notice.slug, notice]),
  );

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

      {draftFiles.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">레포 원고</span>
            <span className="text-[11px] text-gray-400">
              docs/notices/ 에 커밋된 원고입니다. 등록하면 초안(비노출)으로 만들어지고,
              원고를 고쳤으면 다시 불러와 덮어쓸 수 있어요.
            </span>
          </div>
          {draftFiles.map((file) => {
            const registered = registeredBySlug.get(file.slug);
            return (
              <div
                key={file.slug}
                className="flex flex-col gap-1.5 rounded-lg border border-gray-100 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {file.draft.title || "(제목 없음)"}
                    </span>
                    <span className="truncate text-[11px] text-gray-400">
                      {file.slug}
                    </span>
                  </div>
                  {registered ? (
                    <Button
                      variant="secondary"
                      className="h-8 shrink-0 gap-1 text-xs"
                      disabled={registeringSlug !== null || !file.draft.title}
                      onClick={() => handleSyncDraft(file, registered)}
                    >
                      {registeringSlug === file.slug ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      원고로 다시 불러오기
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="h-8 shrink-0 gap-1 text-xs"
                      disabled={registeringSlug !== null || !file.draft.title}
                      onClick={() => handleRegisterDraft(file)}
                    >
                      {registeringSlug === file.slug ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileDown className="h-3.5 w-3.5" />
                      )}
                      초안으로 등록
                    </Button>
                  )}
                </div>
                {file.warnings.length > 0 && (
                  <ul className="flex flex-col gap-0.5 rounded-md bg-amber-50 p-2 text-[11px] text-amber-800">
                    {file.warnings.map((warning, index) => (
                      <li key={index}>· {warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!isLoading && notices.length === 0 && (
          <div className="rounded-xl bg-white py-10 text-center text-sm text-gray-500">
            등록된 공지가 없어요. 새 공지를 만들어 보세요.
          </div>
        )}
        {notices.map((notice) => {
          const status = noticeStatus(notice);
          const imageCount = parseNoticeImages(notice.images).length;
          return (
            <div
              key={notice.id}
              className="flex flex-col gap-2 rounded-xl bg-white p-4"
            >
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
                  {` · 이미지 ${imageCount}장`}
                  {notice.cta_label ? ` · CTA "${notice.cta_label}"` : ""}
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
        <DialogContent className="flex max-h-[85vh] w-11/12 flex-col gap-0 overflow-hidden rounded-xl p-0">
          <DialogHeader className="space-y-1 border-b px-5 py-4 pr-12 text-left">
            <DialogTitle>{editingId ? "공지 수정" : "새 공지"}</DialogTitle>
            <DialogDescription className="text-xs">
              {isPreview
                ? "사용자에게 보이는 그대로입니다."
                : "이미지는 넘겨 보고, 본문은 이미지 아래에 표시됩니다."}
            </DialogDescription>
          </DialogHeader>

          <div ref={editorScrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {isPreview ? (
            // 실제 공지 모달과 같은 구성(어두운 배경 · 카드 · 카드 밖 보조 액션)으로 그린다
            <div className="rounded-xl bg-gray-800 p-4">
              <div className="w-full rounded-2xl bg-white pb-5">
                <div className="px-5 pt-5 text-lg font-semibold">
                  📢 {form.title || "(제목 없음)"}
                </div>
                <NoticeContent
                  images={form.images}
                  body={form.body}
                  ctaLabel={form.ctaLabel || null}
                  ctaUrl={form.ctaUrl || null}
                />
              </div>
              <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                <X className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">제목</span>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="예: 새로워진 말씀카드"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">
                  이미지{form.images.length > 0 && ` (${form.images.length}장)`}
                </span>
                {form.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {form.images.map((url, index) => (
                      <div key={index} className="relative shrink-0">
                        <img
                          src={url}
                          alt={`이미지 ${index + 1}`}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }))
                          }
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                          aria-label="이미지 제거"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="/images/notice/<slug>/1.png"
                      className="pl-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    disabled={!imageUrlInput.trim()}
                    onClick={handleAddImageUrl}
                  >
                    추가
                  </Button>
                </div>
                <p className="text-[11px] text-gray-400">
                  릴리스 공지는 레포 경로를 쓰고, 즉석 공지만 아래 업로드를 씁니다.
                </p>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 py-5 text-xs text-gray-500 hover:bg-gray-50">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      이미지 올리기 (여러 장 선택 가능)
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleUploadImages(files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-700">본문</span>
                <textarea
                  value={form.body}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, body: e.target.value }))
                  }
                  placeholder={"공지 내용을 적어주세요.\n\n**굵게**\n- 항목"}
                  className="min-h-32 rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">
                    버튼
                  </span>
                  <span className="text-[11px] text-gray-400">선택</span>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-500">문구</span>
                  <Input
                    value={form.ctaLabel}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))
                    }
                    placeholder="예: 말씀카드 만들러 가기"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-500">이동 링크</span>
                  <Input
                    value={form.ctaUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ctaUrl: e.target.value }))
                    }
                    placeholder="예: /bible-card/new"
                  />
                  <span className="text-[11px] text-gray-400">
                    앱 내 이동은 /로 시작하는 경로, 외부는 https:// 주소
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
                <span className="text-xs font-medium text-gray-700">
                  노출 설정
                </span>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-500">대상</span>
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
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-500">시작</span>
                  <Input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                    }
                    className={DATE_INPUT_CLASS}
                  />
                  <span className="text-[11px] text-gray-400">
                    비워두면 저장 즉시 시작됩니다.
                  </span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-500">종료</span>
                  <Input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, endsAt: e.target.value }))
                    }
                    className={DATE_INPUT_CLASS}
                  />
                  <span className="text-[11px] text-gray-400">
                    비워두면 중지할 때까지 계속 노출됩니다.
                  </span>
                </label>
              </div>
            </div>
          )}
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 border-t px-5 py-3 sm:justify-between">
            <button
              type="button"
              onClick={() => setIsPreview((prev) => !prev)}
              className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
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
            <div className="flex items-center gap-2">
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
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default NoticeManager;
