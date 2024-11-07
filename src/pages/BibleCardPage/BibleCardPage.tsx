import { useEffect, useRef, useState } from "react";
import MainHeader from "../MainPage/MainHeader";
import { createBibleVerse, fetchBgImage } from "@/apis/openai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipLoader } from "react-spinners";
import download from "downloadjs";
import html2canvas from "html2canvas";
import useBaseStore from "@/stores/baseStore";
import { dataURLToFile, enterLine, getTodayNumber } from "@/lib/utils";
import { getPublicUrl, uploadImage } from "@/apis/file";
import { UserBibleCardLink } from "@/components/share/KakaoShareBtn";
import { BiDownload } from "react-icons/bi";
import { analyticsTrack } from "@/analytics/analytics";
import kakaoShareIcon from "@/assets/kakaoShareIcon.png";
import instagramIcon from "@/assets/instagramIcon.png";

const BibleCardPage = () => {
  const getBible = useBaseStore((state) => state.getBible);

  const bibleCardRef = useRef(null);
  const [inputContent, setInputContent] = useState("");
  const [body, setBody] = useState("");
  const [verse, setVerse] = useState("");
  const [bgImage, setBgImageUrl] = useState("");

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
        scale: 2,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const pngFile = dataURLToFile(dataUrl, `Card_${getTodayNumber()}.png`);
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

  const onClickDownload = async () => {
    try {
      const response = await fetch(publicUrl);
      if (!response.ok) return null;
      const blob = await response.blob();
      download(blob, "BibleCard.png");
    } catch (error) {
      return null;
    }
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

  const onClickInstagramShare = async () => {
    const storyUrl = `instagram-stories://share?source_application=538115812331385`;
    window.location.href = storyUrl;
  };

  return (
    <div className="w-full h-full flex flex-col items-center pt-11 gap-6">
      <MainHeader />
      <div className="text-xl font-light">말씀 카드 만들기</div>

      <section className="relative w-5/6 aspect-square">
        <div className="z-40 absolute inset-0 w-full h-full flex justify-center items-center bg-gray-300">
          <ClipLoader size={20} loading={loading} />
        </div>
        <div ref={bibleCardRef} className="absolute inset-0 w-full h-full">
          <img src={bgImage} className="z-0 absolute inset-0 w-full h-full" />
          <div className="z-10 absolute inset-0 bg-black opacity-35 flex justify-center items-center"></div>
          <div className="z-20 absolute inset-0 flex flex-col w-full h-full p-2 justify-center items-center gap-3 handwritten font-bold text-2xl text-white text-center whitespace-pre-wrap ">
            <p>{body}</p>
            <p>{verse}</p>
          </div>
          <span className="z-20 absolute bottom-5 right-5 font-bold text-white">
            PrayU
          </span>
        </div>
        {publicUrl && (
          <img
            src={publicUrl}
            className={`absolute inset-0 w-full h-full z-50 transition-opacity duration-1000 ease-in ${
              isimageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => {
              setIsImageLoaded(true);
              setLoading(false);
            }}
          />
        )}
      </section>

      <Textarea
        className="text-sm w-5/6 h-32 p-4 rounded-md overflow-y-auto no-scrollbar text-gray-700"
        value={inputContent}
        onChange={(e) => setInputContent(e.target.value)}
        placeholder={`기도제목을 작성하고 나만의 말씀카드를 만들어요`}
        readOnly={loading}
      />
      <Button
        onClick={() => onClickCreateBibleCard()}
        variant="primary"
        className="w-5/6"
        disabled={loading}
      >
        말씀카드 만들기
      </Button>
      {isimageLoaded && (
        <div className="flex justify-center items-center gap-2">
          <BiDownload size={30} onClick={() => onClickDownload()} />
          <img
            src={kakaoShareIcon}
            className="w-10 aspect-square"
            onClick={() => onClickKakaoShare()}
          />
          <img
            src={instagramIcon}
            className="w-10 aspect-square"
            onClick={() => onClickInstagramShare()}
          />
        </div>
      )}
    </div>
  );
};

export default BibleCardPage;
