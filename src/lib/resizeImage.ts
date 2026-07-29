/**
 * 업로드 전 이미지 축소·재인코딩.
 *
 * 감사카드 사진은 사용자가 고른 파일이 **원본 그대로** 올라가고 있었다.
 * 요즘 폰 사진은 장당 3~5MB 라, 스토리지 한도(1GB)가 사진 200장이면 찬다.
 * 스토리지를 어디로 옮기든 원본 업로드는 그 자체로 문제이므로 올리기 전에 줄인다.
 * (PrayU-Api/docs/storage-r2-plan.md)
 *
 * 화면에서 쓰는 크기(카드·미리보기)보다 훨씬 큰 원본을 보관할 이유가 없다.
 */

export interface ResizeImageOptions {
  /** 긴 변의 최대 픽셀. 기본 1600 — 카드·상세 보기에 충분하다 */
  maxSize?: number;
  /** JPEG 품질 (0~1) */
  quality?: number;
}

/**
 * 줄인 파일을 돌려준다. 줄일 수 없거나 오히려 커지면 **원본을 그대로** 돌려준다.
 * 실패해도 업로드 자체는 막지 않는다.
 */
export const resizeImageFile = async (
  file: File,
  { maxSize = 1600, quality = 0.85 }: ResizeImageOptions = {},
): Promise<File> => {
  if (!file.type.startsWith("image/")) return file;
  // GIF 는 애니메이션이 날아가고, SVG 는 래스터화되면 손해다
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    // 폰 사진은 회전 정보(EXIF)를 메타데이터로 들고 있다.
    // from-image 로 읽어야 캔버스에 그릴 때 눕지 않는다.
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const longSide = Math.max(bitmap.width, bitmap.height);
    const scale = longSide > maxSize ? maxSize / longSide : 1;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    // 이미 잘 압축된 파일이면 재인코딩이 되레 커진다 — 그때는 원본을 쓴다
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpeg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    // 손상된 파일·미지원 포맷 등 — 원본으로 진행한다
    return file;
  }
};
