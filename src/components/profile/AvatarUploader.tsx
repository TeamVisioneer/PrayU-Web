import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useBaseStore from "@/stores/baseStore";
import { useToast } from "../ui/use-toast";
import { analyticsTrack } from "@/analytics/analytics";
import { resizeImageFile } from "@/lib/resizeImage";
import { uploadImage } from "@/apis/file";
import { assetUrl } from "@/lib/assetUrl";

const DEFAULT_AVATAR = "/images/defaultProfileImage.png";

/**
 * 내 프로필 히어로 아바타 + 사진 변경 (plans/profile-photo.md).
 * 512px 단일 사용본만 저장한다 — 원본은 보관하지 않는다 (표시 최대 80px, 재편집 수요 없음).
 * 저장 값은 avatar_url 에 절대 URL — 렌더 소비처들이 카카오 URL 과 같은 형태를 기대한다.
 */
const AvatarUploader = () => {
  const { user } = useAuth();
  const myProfile = useBaseStore((state) => state.myProfile);
  const updateProfile = useBaseStore((state) => state.updateProfile);
  const getProfile = useBaseStore((state) => state.getProfile);
  const { toast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 change 가 발화하도록 즉시 비운다
    event.target.value = "";
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const resized = await resizeImageFile(file, { maxSize: 512 });
      const uploaded = await uploadImage(resized, "avatar");
      const publicUrl = uploaded
        ? (uploaded.url ?? assetUrl(uploaded.key))
        : null;
      if (!publicUrl) {
        toast({ description: "사진 업로드에 실패했어요. 다시 시도해 주세요" });
        return;
      }
      const updated = await updateProfile(user.id, { avatar_url: publicUrl });
      if (!updated) {
        toast({ description: "사진 변경에 실패했어요. 다시 시도해 주세요" });
        return;
      }
      await getProfile(user.id);
      toast({ description: "프로필 사진을 변경했어요" });
    } catch {
      toast({ description: "사진 변경에 실패했어요. 다시 시도해 주세요" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isUploading}
      onClick={() => {
        analyticsTrack("클릭_내프로필_사진변경", {});
        inputRef.current?.click();
      }}
      className="relative shrink-0"
      aria-label="프로필 사진 변경"
    >
      <img
        className={`h-20 w-20 rounded-full object-cover ring-4 ring-white ${
          isUploading ? "opacity-50" : ""
        }`}
        src={myProfile?.avatar_url || DEFAULT_AVATAR}
        onError={(e) => {
          // 깨진 외부 URL(만료된 카카오 CDN 등) 폴백 — 기본 이미지에서 또 실패해도 재발화하지 않게 가드
          if (!e.currentTarget.src.endsWith(DEFAULT_AVATAR)) {
            e.currentTarget.src = DEFAULT_AVATAR;
          }
        }}
        alt="프로필 사진"
      />
      {isUploading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accentTo" />
        </span>
      ) : (
        <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-accentFrom to-accentTo ring-2 ring-white">
          <Camera size={14} className="text-white" />
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChangeFile}
      />
    </button>
  );
};

export default AvatarUploader;
