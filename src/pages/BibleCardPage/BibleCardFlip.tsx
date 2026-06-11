import { useRef, useState } from "react";
import { createBibleVerse } from "@/apis/openai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import html2canvas from "html2canvas";
import useBaseStore from "@/stores/baseStore";
import { dataURLToFile, getTodayNumber } from "@/lib/utils";
import { getPublicUrl, uploadImage } from "@/apis/file";
import { UserBibleCardLink } from "@/components/share/KakaoShareBtn";
import { analyticsTrack } from "@/analytics/analytics";
import kakaoShareIcon from "@/assets/kakaoShareIcon.png";
import instagramIcon from "@/assets/instagramIcon.png";
import {
  MdOutlineFileDownload,
  MdOutlineShare,
  MdOutlineLink,
} from "react-icons/md";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import BibleCardUI from "./BibleCardUI";
import { cn } from "@/lib/utils";
import { IoCaretUpOutline } from "react-icons/io5";
import { PulseLoader } from "react-spinners";

interface BibleCardFlipProps {
  className?: string;
}

const BibleCardFlip: React.FC<BibleCardFlipProps> = ({ className }) => {
  const user = useBaseStore((state) => state.user);
  const isApp = useBaseStore((state) => state.isApp);
  const getBible = useBaseStore((state) => state.getBible);
  const createPrayCardWithParams = useBaseStore(
    (state) => state.createPrayCardWithParams
  );

  const bibleCardRef = useRef(null);
  const [inputBody, setInputBody] = useState("");
  const [inputName, setInputName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const [publicUrl, setPublicUrl] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const onClickCreateBibleCard = async () => {
    analyticsTrack("클릭_말씀카드_생성", {});
    if (inputBody.length < 15) {
      alert("기도제목은 15자 이상이 필요해요😭");
      return;
    }
    setLoading(true);
    setIsEnded(false);

    const targetBible = await fetchBibleVerse();
    if (!targetBible) {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }
    const publicUrl = await loadImage();
    if (!publicUrl) {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }

    setIsEnded(true);
  };

  const fetchBibleVerse = async () => {
    const bibleVerseData = await createBibleVerse(inputBody);
    if (bibleVerseData.length == 0) return null;
    const { long_label, chapter, paragraph } = bibleVerseData[0];
    setKeywords(bibleVerseData.map((bible) => bible.keyword));
    const targetBible = await getBible(long_label, chapter, paragraph);
    return targetBible;
  };

  const loadImage = async () => {
    if (bibleCardRef.current === null) return null;
    try {
      const canvas = await html2canvas(bibleCardRef.current);
      const dataUrl = canvas.toDataURL("image/jpeg", 2);
      const pngFile = dataURLToFile(dataUrl, `Card_${getTodayNumber()}.jpeg`);
      const pathData = await uploadImage(
        pngFile,
        `BibleCard/UserBibleCard/${pngFile.name}`
      );
      if (!pathData) return null;
      const publicUrl = getPublicUrl(pathData.path);
      setPublicUrl(publicUrl || "");

      const praycard = await createPrayCardWithParams({
        content: inputBody,
        bible_card_url: publicUrl,
      });
      if (praycard && !user) {
        localStorage.setItem("prayCardId", praycard.id);
        localStorage.setItem("prayCardContent", inputBody);
      }
      return publicUrl;
    } catch {
      return null;
    }
  };

  const onClickSocialShare = async () => {
    analyticsTrack("클릭_공유_소셜공유", { where: "BibleCardPage" });
    const currentUrl = window.location.href;
    await navigator.share({
      url: currentUrl,
    });
  };

  const onClickCopyLink = async () => {
    analyticsTrack("클릭_공유_링크복사", { where: "BibleCardPage" });
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => toast({ description: "링크가 복사되었어요" }));
  };

  const onClickKakaoShare = async () => {
    try {
      const kakaoLinkObject = UserBibleCardLink(publicUrl);
      analyticsTrack("클릭_카카오_공유", { where: "BibleCardPage" });
      window.Kakao.Share.sendDefault(kakaoLinkObject);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onClickInstagramShare = async () => {
    analyticsTrack("클릭_인스타그램_공유", { where: "BibleCardPage" });
    if (
      window.flutter_inappwebview &&
      window.flutter_inappwebview.callHandler
    ) {
      await window.flutter_inappwebview.callHandler(
        "shareInstagramStory",
        publicUrl
      );
    }
  };

  const onClickDownload = async () => {
    analyticsTrack("클릭_다운로드", { where: "BibleCardPage" });
    if (
      window.flutter_inappwebview &&
      window.flutter_inappwebview.callHandler
    ) {
      const result = (await window.flutter_inappwebview.callHandler(
        "downloadImages",
        [publicUrl]
      )) as { status: string };
      if (result.status === "success") {
        toast({ description: "다운로드 완료" });
      } else {
        toast({ description: "다운로드 실패" });
      }
    }
  };

  const onClickCard = () => {
    if (!loading && isEnded) setIsFlipped((prev) => !prev);
  };

  return (
    <div
      className={cn(
        className,
        "relative w-full h-full flex flex-col justify-start items-center gap-6 px-10 overflow-x-hidden overflow-y-scroll no-scrollbar"
      )}
    >
      <section ref={bibleCardRef} className="absolute -z-10">
        <BibleCardUI name={inputName} keywords={keywords} />
      </section>

      <div className="w-full aspect-[2/3] perspective-1000 flex flex-col justify-center">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          <section
            onClick={() => onClickCard()}
            className="absolute w-full h-full bg-white shadow-lg rounded-lg backface-hidden flex flex-col items-center justify-center gap-5 p-5"
          >
            <div className="w-full flex flex-col gap-2">
              <h3>이름</h3>
              <Input
                className={`p-2  ${
                  isEnded
                    ? "border-none"
                    : "focus-visible:border-1 focus-visible:border-[#608CFF]"
                }`}
                value={inputName}
                maxLength={6}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="이름을 입력해 주세요"
                readOnly={loading || isEnded}
              />
            </div>
            <div className="w-full h-full flex flex-col gap-2">
              <h3>기도제목</h3>
              <Textarea
                className={`text-sm w-full h-full p-2 rounded-md overflow-y-auto no-scrollbar text-gray-700 ${
                  isEnded
                    ? "border-none"
                    : "focus-visible:border-1 focus-visible:border-[#608CFF]"
                }`}
                value={inputBody}
                onChange={(e) => setInputBody(e.target.value)}
                placeholder="(예시) 삶 가운데에서 하나님을 더욱 찾을 수 있도록 도와주세요"
                readOnly={loading || isEnded}
              />
            </div>
          </section>

          <section
            onClick={() => onClickCard()}
            className="absolute bottom-0 w-full  shadow-lg rounded-[16px] rotate-y-180 backface-hidden flex flex-col items-center justify-center"
          >
            <img
              src={publicUrl}
              className="w-full rounded-[16px]"
              onLoad={() => {
                setLoading(false);
                setIsFlipped(true);
              }}
            />
          </section>
        </div>
      </div>

      <section className="w-full flex flex-col items-center gap-2">
        {!loading && isEnded ? (
          <div className="w-full flex flex-col items-center gap-4 ">
            {!isApp && (
              <div className="flex items-center gap-1 font-bold">
                <IoCaretUpOutline />
                <p>꾹 눌러서 말씀카드 저장하기</p>
                <IoCaretUpOutline />
              </div>
            )}
            <div className="w-full flex flex-col gap-2 items-center">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  analyticsTrack("클릭_PrayU_시작", {}),
                    (window.location.href = "/");
                }}
              >
                PrayU 에서 기도제목 보기
              </Button>
            </div>
            <section className="w-full flex flex-col gap-4">
              <div className="w-full flex justify-center items-center gap-4 ">
                <hr className="flex-grow bg-gray-400" />
                <span className="text-sm text-gray-400">친구에게 공유하기</span>
                <hr className="flex-grow bg-gray-400" />
              </div>
              <div className="flex justify-center items-center gap-4">
                {isApp && (
                  <MdOutlineFileDownload
                    size={30}
                    onClick={() => onClickDownload()}
                  />
                )}
                <MdOutlineLink size={30} onClick={() => onClickCopyLink()} />
                <MdOutlineShare
                  size={30}
                  onClick={() => onClickSocialShare()}
                />
                <img
                  src={kakaoShareIcon}
                  className="w-8 aspect-square"
                  onClick={() => onClickKakaoShare()}
                />
                {isApp && (
                  <img
                    src={instagramIcon}
                    className="w-8 aspect-square"
                    onClick={() => onClickInstagramShare()}
                  />
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <p className="font-light text-sm">
              {!loading
                ? "기도제목에 맞는 나만의 말씀카드를 만들어요"
                : "카드가 만들어지는 동안 조금만 기다려주세요"}
            </p>
            <Button
              onClick={() => onClickCreateBibleCard()}
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <PulseLoader size={10} color="#f3f4f6" />
              ) : (
                <span>말씀카드 만들기</span>
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default BibleCardFlip;
