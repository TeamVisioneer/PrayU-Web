import { useEffect, useRef, useState } from "react";
import MainHeader from "../MainPage/MainHeader";
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
import { CiSaveUp2, CiLink } from "react-icons/ci";
import { toast } from "@/components/ui/use-toast";
import BibleCardCarousel from "./BibleCardCarousel";
import { Input } from "@/components/ui/input";
import BibleCardUI from "./BibleCardUI";

const BibleCardPage = () => {
  const getBible = useBaseStore((state) => state.getBible);
  const bibleCardRef = useRef(null);
  const [inputBody, setInputBody] = useState("");
  const [inputName, setInputName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const [publicUrl, setPublicUrl] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isEnded) loadImage();
  }, [isEnded]);

  const onClickCreateBibleCard = async () => {
    if (inputBody.length < 15) {
      alert("기도제목은 15자 이상이 필요해요😭");
      return;
    }
    setLoading(true);
    setIsEnded(false);
    const bibleVerseData = await createBibleVerse(inputBody);
    if (bibleVerseData.length == 0) {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }

    const { long_label, chapter, paragraph } = bibleVerseData[0];
    setKeywords(bibleVerseData.map((bible) => bible.keyword));

    const targetBible = await getBible(long_label, chapter, paragraph);
    if (!targetBible) {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }

    setIsEnded(true);
  };

  const loadImage = async () => {
    if (bibleCardRef.current === null) {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }
    try {
      const canvas = await html2canvas(bibleCardRef.current);
      const dataUrl = canvas.toDataURL("image/jpeg", 2);
      const pngFile = dataURLToFile(dataUrl, `Card_${getTodayNumber()}.jpeg`);
      const pathData = await uploadImage(
        pngFile,
        `BibleCard/UserBibleCard/${pngFile.name}`
      );
      if (!pathData) {
        setIsEnded(false);
        setLoading(false);
        alert("생성 버튼을 다시 눌러주세요😭");
        return null;
      }
      const publicUrl = getPublicUrl(pathData.path);
      setPublicUrl(publicUrl || "");
    } catch {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }
  };

  const onClickSocialShare = async () => {
    const currentUrl = window.location.href;

    await navigator.share({
      url: `${currentUrl}/bible-card`,
    });
  };

  const onClickCopyLink = async () => {
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
    } catch {
      return null;
    }
  };

  return (
    <div className="relative w-full h-5/6 flex flex-col items-center py-11 gap-6">
      <MainHeader />
      <div className="text-xl font-light">말씀 카드 만들기</div>

      {!isEnded && (
        <>
          <div className="w-5/6 perspective-1000">
            <div
              className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* 앞면 */}
              <div className="absolute w-full h-full bg-white shadow-lg rounded-lg backface-hidden flex flex-col items-center justify-center p-10">
                <BibleCardCarousel />
              </div>

              {/* 뒷면 */}
              <div className="absolute w-full h-full shadow-lg rounded-lg rotate-y-180 backface-hidden flex flex-col items-center justify-center gap-5 p-5">
                <div className="w-full flex flex-col gap-2">
                  <h3>이름</h3>
                  <Input
                    className="p-4"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="이름을 입력해 주세요"
                    readOnly={loading}
                  />
                </div>
                <div className="w-full h-full flex flex-col gap-2">
                  <h3>기도제목</h3>
                  <Textarea
                    className="text-sm w-full h-full p-4 rounded-md overflow-y-auto no-scrollbar text-gray-700"
                    value={inputBody}
                    onChange={(e) => setInputBody(e.target.value)}
                    placeholder={`기도제목을 작성하고 나만의 말씀카드를 만들어요`}
                    readOnly={loading}
                  />
                </div>
                <Button
                  onClick={() => onClickCreateBibleCard()}
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "말씀카드 만드는 중..." : "말씀카드 만들기"}
                </Button>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <button
            onClick={() => setIsFlipped((prev) => !prev)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
          >
            Flip Card
          </button>
        </>
      )}

      <div ref={bibleCardRef} className="absolute -z-10">
        <BibleCardUI name={inputName} keywords={keywords} />
      </div>

      <section className="w-5/6">
        <img
          src={publicUrl}
          className="w-full"
          onLoad={() => setLoading(false)}
        />
      </section>
      {!loading && isEnded && (
        <>
          <section className="w-5/6 flex flex-col gap-4">
            <div className="w-full flex justify-center items-center gap-4 ">
              <hr className="flex-grow bg-gray-400" />
              <span className="text-sm text-gray-400">친구에게 공유하기</span>
              <hr className="flex-grow bg-gray-400" />
            </div>
            <div className="flex justify-center items-center gap-4">
              <CiLink size={30} onClick={() => onClickCopyLink()} />
              <CiSaveUp2 size={30} onClick={() => onClickSocialShare()} />
              <img
                src={kakaoShareIcon}
                className="w-8 aspect-square"
                onClick={() => onClickKakaoShare()}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default BibleCardPage;
