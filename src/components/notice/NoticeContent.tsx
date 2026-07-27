import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { NoticeMarkdown } from "./noticeMarkdown";
import { NoticeSlide } from "../../../supabase/types/tables";

/**
 * 공지 본문(슬라이드 + CTA) 표시부.
 * 실제 공지 모달과 어드민 미리보기가 **같은 컴포넌트**를 쓴다 —
 * 그래야 미리보기가 실제 노출 모습과 어긋나지 않는다.
 */
interface NoticeContentProps {
  title: string;
  slides: NoticeSlide[];
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  onClickCta?: () => void;
}

const NoticeContent = ({
  title,
  slides,
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
                        alt={slide.tip || title}
                      />
                    )}
                    <div className="w-full space-y-2 text-left">
                      {slide.tip && (
                        <span className="text-sm font-bold">{slide.tip}</span>
                      )}
                      {/* body(마크다운)가 우선. description은 이전 형식 호환 */}
                      {slide.body ? (
                        <NoticeMarkdown source={slide.body} />
                      ) : (
                        (slide.description || []).map((line, lineIndex) => (
                          <p key={lineIndex} className="text-sm text-gray-600">
                            {line}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* 좌우 화살표는 두지 않는다 — 모바일 모달에서 이미지 위에 겹쳐 지저분하고,
                스와이프와 점 인디케이터로 충분하다 */}
            {slides.length > 1 && (
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
            )}
          </Carousel>
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
