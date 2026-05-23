import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { PulseLoader } from "react-spinners";
import { LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBibleCard } from "@/apis/bibleCard";
import { fetchPrayCardByBibleCardId } from "@/apis/prayCard";
import BibleCardView from "@/components/prayCard/BibleCard";
import PrayCard from "@/components/prayCard/PrayCard";
import { analyticsTrack } from "@/analytics/analytics";
import {
  BibleCard as BibleCardType,
  PrayCardWithProfiles,
} from "supabase/types/tables";

const moveToInstallPage = () => {
  if (navigator.userAgent.match(/Android/i)) {
    window.location.href =
      "https://play.google.com/store/apps/details?id=com.team.visioneer.prayu";
  } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    window.location.href =
      "https://itunes.apple.com/kr/app/apple-store/id6711345171";
  } else {
    window.location.href = "https://linktr.ee/prayu.site";
  }
};

const SharedPrayCardBack = ({
  prayCard,
}: {
  prayCard: PrayCardWithProfiles | null;
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-prayCard">
    <div className="h-full w-full blur-[6px]">
      <PrayCard prayCard={prayCard || undefined} isMoreBtn={false} />
    </div>
    <div className="absolute inset-0 flex items-center justify-center bg-white/55 px-8 text-center backdrop-blur-[1px]">
      <div className="flex max-w-[230px] flex-col items-center">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-blue-600 shadow-sm">
          <LockKeyhole size={18} strokeWidth={2.4} />
        </div>
        <p className="text-base font-semibold leading-snug text-gray-950">
          PrayU 기도제목
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          PrayU에서는 같은 그룹 안에서
          <br />
          기도제목을 나눌 수 있어요
        </p>
      </div>
    </div>
  </div>
);

const BibleCardSharePage = () => {
  const navigate = useNavigate();
  const { bibleCardId } = useParams<{ bibleCardId: string }>();
  const [bibleCard, setBibleCard] = useState<BibleCardType | null>(null);
  const [prayCard, setPrayCard] = useState<PrayCardWithProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchSharedBibleCard = async () => {
      if (!bibleCardId) {
        setIsLoading(false);
        return;
      }

      const [targetBibleCard, targetPrayCard] = await Promise.all([
        getBibleCard(bibleCardId),
        fetchPrayCardByBibleCardId(bibleCardId),
      ]);
      setBibleCard(targetBibleCard);
      setPrayCard(targetPrayCard);
      setIsLoading(false);
    };

    analyticsTrack("진입_말씀카드_공유페이지", { bibleCardId });
    fetchSharedBibleCard();
  }, [bibleCardId]);

  const handleInstallApp = () => {
    analyticsTrack("클릭_공유말씀카드_앱설치", { bibleCardId });
    moveToInstallPage();
  };

  const handleFlipCard = () => {
    analyticsTrack("클릭_공유말씀카드_카드뒤집기", {
      bibleCardId,
      to: isFlipped ? "BibleCard" : "PrayCard",
    });
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-mainBg">
      <header className="sticky top-0 z-50 flex items-center border-b bg-mainBg p-4">
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <IoChevronBack size={20} />
        </button>
        <h1 className="w-full truncate px-20 text-center text-lg font-bold">
          {bibleCard ? `${bibleCard.name}님의 말씀카드` : "PrayU 말씀카드"}
        </h1>
        {!navigator.userAgent.match(/prayu/i) && (
          <Badge
            variant="secondary"
            className="absolute right-4 cursor-pointer rounded-sm border-gray-300 text-base font-normal"
            onClick={handleInstallApp}
          >
            앱설치
          </Badge>
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 pb-8 pt-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <PulseLoader size={10} color="#608CFF" />
          </div>
        ) : !bibleCard ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-xl font-bold text-gray-950">
              말씀카드를 찾을 수 없어요
            </p>
            <p className="text-sm leading-relaxed text-gray-500">
              링크가 만료되었거나 삭제된 말씀카드일 수 있어요.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/")}
              className="mt-4 h-[52px] w-full max-w-[320px] rounded-xl text-base"
            >
              PrayU 홈으로 가기
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center">
            <p className="mb-5 max-w-[320px] text-center text-sm leading-relaxed text-gray-500">
              PrayU가 기도제목에 어울리는 말씀카드를 만들어주어요.
            </p>

            <div className="w-full max-w-[320px]">
              <button
                type="button"
                onClick={handleFlipCard}
                className="w-full perspective-1000 text-left"
              >
                <div
                  className={`relative aspect-[3/4] w-full transition-transform duration-700 transform-style-preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  <div className="absolute inset-0 backface-hidden">
                    {bibleCard.image_url ? (
                      <img
                        src={bibleCard.image_url}
                        alt="공유된 말씀카드"
                        className="aspect-[3/4] w-full rounded-xl object-cover shadow-prayCard"
                      />
                    ) : (
                      <BibleCardView bibleCard={bibleCard} />
                    )}
                  </div>
                  <div className="absolute inset-0 rotate-y-180 backface-hidden">
                    <SharedPrayCardBack prayCard={prayCard} />
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={handleFlipCard}
                className="mx-auto mt-3 block rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm"
              >
                {isFlipped ? "말씀카드 보기" : "기도카드 보기"}
              </button>
            </div>

            <section className="mt-4 w-full max-w-[320px] text-center">
              <Button
                variant="primary"
                onClick={handleInstallApp}
                className="w-full rounded-lg py-6 text-base"
              >
                PrayU 앱에서 시작하기
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/story")}
                className="mt-2 h-11 w-full rounded-lg text-sm font-normal text-gray-500"
              >
                PrayU 소개 보기
              </Button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default BibleCardSharePage;
