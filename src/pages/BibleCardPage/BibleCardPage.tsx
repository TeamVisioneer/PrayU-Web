import { useEffect, useRef, useState } from "react";
import MainHeader from "../MainPage/MainHeader";
import { createBibleVerse, fetchBgImage } from "@/apis/openai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipLoader } from "react-spinners";
import html2canvas from "html2canvas";
import useBaseStore from "@/stores/baseStore";
import { dataURLToFile, enterLine, getTodayNumber } from "@/lib/utils";
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

  const [publicUrl, setPublicUrl] = useState("");
  const [isimageLoaded, setIsImageLoaded] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEnded) loadImage();
  }, [isEnded]);

  const onClickCreateBibleCard = async () => {
    if (inputContent.length < 20) {
      alert("기도제목은 20자 이상이 필요해요😭");
      return;
    }
    setLoading(true);
    setIsEnded(false);
    setBgImageUrl("");
    setBody("");
    setVerse("");
    setPublicUrl("");
    setIsImageLoaded(false);
    const bibleVerseData = await createBibleVerse(inputContent);
    if (bibleVerseData.length == 0) {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }

    const { long_label, chapter, paragraph, nature } = bibleVerseData[0];

    const targetBible = await getBible(long_label, chapter, paragraph);
    const imageData = await fetchBgImage(nature);
    if (!targetBible || imageData.length == 0) {
      setIsEnded(false);
      setLoading(false);
      alert("생성 버튼을 다시 눌러주세요😭");
      return null;
    }
    setBgImageUrl(imageData[0]);
    setBody(enterLine(targetBible.sentence));
    setVerse(
      `${long_label} ${chapter}${
        long_label == "시편" ? "편" : "장"
      } ${paragraph}절`
    );
    setIsEnded(true);
  };

  const loadImage = async () => {
    if (bibleCardRef.current === null) return "";
    try {
      const canvas = await html2canvas(bibleCardRef.current, {
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
      const pngFile = dataURLToFile(dataUrl, `Card_${getTodayNumber()}.jpeg`);
      const pathData = await uploadImage(
        pngFile,
        `BibleCard/UserBibleCard/${pngFile.name}`
      );
      if (!pathData) return "";
      const publicUrl = getPublicUrl(pathData.path);
      setPublicUrl(publicUrl || "");
    } catch {
      return "";
    }
  };

  const onClickSocialShare = async () => {
    await navigator.share({
      url: "https://example.com/story-url",
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
    <div className="w-full h-5/6 flex flex-col items-center pt-11 gap-6">
      <MainHeader />
      <div className="text-xl font-light">말씀 카드 만들기</div>

      <section className="relative w-5/6 transition-all duration-300 ease-in">
        <BibleCardCarousel />
        <BibleCardUI name="김명준" />
      </section>

      <section className="w-5/6 flex-grow flex flex-col items-center gap-5 transition-all duration-300 ease-in">
        <div className="w-full flex flex-col gap-2">
          <h3>이름</h3>
          <Input
            className="p-4 "
            value={inputBody}
            onChange={(e) => setInputBody(e.target.value)}
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
      </section>

      {isimageLoaded && (
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
      )}
    </div>
  );
};

export default BibleCardPage;
