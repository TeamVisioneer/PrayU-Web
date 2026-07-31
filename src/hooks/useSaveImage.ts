import { RefObject, useCallback } from "react";
import { domToBlob } from "modern-screenshot";
import { UploadedImage, UploadKind, uploadImage } from "@/apis/file";
import { getTodayNumber } from "@/lib/utils";

interface SaveImageOptions {
  kind?: UploadKind; // 업로드 용도 — 저장 경로는 서버가 이 값으로 정한다 (기본값: 'bible_card')
  fileName?: string; // 파일명 (기본값: 'Card_{timestamp}.jpeg')
  imageFormat?: "jpeg" | "png"; // 이미지 포맷 (기본값: 'jpeg')
  quality?: number; // 이미지 품질 (0-1, 기본값: 0.85)
  scale?: number; // 고해상도 배율 (기본값: 2 - Retina 디스플레이 대응)
}

/**
 * DOM 요소를 이미지로 캡처해 업로드하는 커스텀 훅
 *
 * @returns saveImage — 저장할 값(`{ key, url }`)을 돌려준다. 실패 시 null
 *
 * @example
 * const { saveImage } = useSaveImage();
 * const cardRef = useRef<HTMLDivElement>(null);
 *
 * const handleSave = async () => {
 *   const uploaded = await saveImage(cardRef, { kind: "bible_card" });
 *   if (!uploaded) return alert("이미지 저장 실패");
 *   await createCard({ image_key: uploaded.key, image_url: uploaded.url });
 * };
 */
export function useSaveImage() {
  const saveImage = useCallback(
    async (
      elementRef: RefObject<HTMLElement>,
      options?: SaveImageOptions,
    ): Promise<UploadedImage | null> => {
      // 기본값 설정
      const {
        kind = "bible_card",
        fileName = `Card_${getTodayNumber()}.jpeg`,
        imageFormat = "jpeg",
        quality = 0.85,
        scale = 2,
      } = options || {};

      // Step 1: Ref 유효성 검사
      if (!elementRef.current) {
        console.error("useSaveImage: elementRef.current is null");
        return null;
      }

      try {
        // Step 2: 커스텀 폰트(handwrittenV2 등)가 로드되기 전에 캡처하면
        // 폴백 폰트로 찍힌 이미지가 저장되므로 폰트 로드를 먼저 기다린다
        await document.fonts.ready;

        // Step 3: DOM 캡처 (modern-screenshot 사용)
        const blob = await domToBlob(elementRef.current, {
          scale,
          quality,
          type: `image/${imageFormat}`,
        });

        if (!blob) {
          console.error("useSaveImage: Failed to create blob from element");
          return null;
        }

        // Step 4: Blob을 File 객체로 변환
        const file = new File([blob], fileName, {
          type: `image/${imageFormat}`,
        });

        // Step 5: 업로드 — 저장할 값(key 또는 레거시 url)을 그대로 돌려준다
        const uploaded = await uploadImage(file, kind);

        if (!uploaded) {
          console.error("useSaveImage: Failed to upload image");
          return null;
        }

        return uploaded;
      } catch (error) {
        console.error("useSaveImage: Error during image save process", error);
        return null;
      }
    },
    [],
  );

  return { saveImage };
}
