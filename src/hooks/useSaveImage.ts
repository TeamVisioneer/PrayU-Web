import { RefObject, useCallback } from "react";
import { domToBlob } from "modern-screenshot";
import { getPublicUrl, uploadImage } from "@/apis/file";
import { getTodayNumber } from "@/lib/utils";

interface SaveImageOptions {
  storagePath?: string; // Supabase storage 경로 (기본값: 'BibleCard/UserBibleCard')
  fileName?: string; // 파일명 (기본값: 'Card_{timestamp}.jpeg')
  imageFormat?: "jpeg" | "png"; // 이미지 포맷 (기본값: 'jpeg')
  quality?: number; // 이미지 품질 (0-1, 기본값: 0.95)
  scale?: number; // 고해상도 배율 (기본값: 2 - Retina 디스플레이 대응)
}

/**
 * DOM 요소를 이미지로 캡처하여 Supabase에 업로드하는 커스텀 훅
 *
 * @returns saveImage 함수를 반환
 *
 * @example
 * const { saveImage } = useSaveImage();
 * const cardRef = useRef<HTMLDivElement>(null);
 *
 * const handleSave = async () => {
 *   const url = await saveImage(cardRef, {
 *     storagePath: 'BibleCard/UserBibleCard',
 *     fileName: `Card_${Date.now()}.jpeg`,
 *     imageFormat: 'jpeg',
 *     quality: 0.95,
 *     scale: 2
 *   });
 *
 *   if (url) {
 *     console.log('이미지 저장 성공:', url);
 *   } else {
 *     alert('이미지 저장 실패');
 *   }
 * };
 */
export function useSaveImage() {
  const saveImage = useCallback(
    async (
      elementRef: RefObject<HTMLElement>,
      options?: SaveImageOptions,
    ): Promise<string | null> => {
      // 기본값 설정
      const {
        storagePath = "BibleCard/UserBibleCard",
        fileName = `Card_${getTodayNumber()}.jpeg`,
        imageFormat = "jpeg",
        quality = 0.95,
        scale = 2,
      } = options || {};

      // Step 1: Ref 유효성 검사
      if (!elementRef.current) {
        console.error("useSaveImage: elementRef.current is null");
        return null;
      }

      try {
        // Step 2: DOM 캡처 (modern-screenshot 사용)
        const blob = await domToBlob(elementRef.current, {
          scale,
          quality,
          type: `image/${imageFormat}`,
        });

        if (!blob) {
          console.error("useSaveImage: Failed to create blob from element");
          return null;
        }

        // Step 3: Blob을 File 객체로 변환
        const file = new File([blob], fileName, {
          type: `image/${imageFormat}`,
        });

        // Step 4: Supabase 업로드
        const pathData = await uploadImage(file, `${storagePath}/${fileName}`);

        if (!pathData) {
          console.error("useSaveImage: Failed to upload image to Supabase");
          return null;
        }

        // Step 5: Public URL 생성 및 반환
        const publicUrl = getPublicUrl(pathData.path);

        if (!publicUrl) {
          console.error("useSaveImage: Failed to get public URL");
          return null;
        }

        return publicUrl;
      } catch (error) {
        console.error("useSaveImage: Error during image save process", error);
        return null;
      }
    },
    [],
  );

  return { saveImage };
}
