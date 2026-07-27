import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { NoticeMarkdown } from "./noticeMarkdown";

/**
 * 공지 본문 표시부 — 이미지 여러 장(넘겨 봄) + 본문 하나(그 아래) + CTA.
 * 실제 공지 모달과 어드민 미리보기가 **같은 컴포넌트**를 쓴다 —
 * 그래야 미리보기가 실제 노출 모습과 어긋나지 않는다.
 */
interface NoticeContentProps {
  images: string[];
  body?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  onClickCta?: () => void;
}

const NoticeContent = ({
  images,
  body,
  ctaLabel,
  ctaUrl,
  onClickCta,
}: NoticeContentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => setCurrentIndex(api.selectedScrollSnap()));
  }, [api]);

  return (
    <>
      {images.length > 0 && (
        <div className="w-full px-5 pt-3">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {images.map((url, index) => (
                <CarouselItem key={index}>
                  <img
                    src={url}
                    className="w-full rounded-lg shadow-md"
                    alt={`공지 이미지 ${index + 1}`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* 좌우 화살표는 두지 않는다 — 모바일 모달에서 이미지 위에 겹친다.
              스와이프와 점 인디케이터로 충분하다 */}
          {images.length > 1 && (
            <div className="flex items-center justify-center pt-3">
              {images.map((_, index) => (
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
          )}
        </div>
      )}

      {body && (
        <div className="w-full px-5 pt-4 text-left">
          <NoticeMarkdown source={body} />
        </div>
      )}

      {/* 모달의 유일한 주 액션 — 보조 액션은 카드 밖에 있다 */}
      {ctaLabel && ctaUrl && (
        <div className="px-5 pt-5">
          <button
            onClick={onClickCta}
            className="h-[52px] w-full rounded-xl bg-[#608CFF] text-base font-semibold text-white shadow-md shadow-[#608CFF]/30 transition hover:bg-[#4a70e2] active:scale-[0.99]"
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </>
  );
};

export default NoticeContent;
