import { useState } from "react";
import MainHeader from "../MainPage/MainHeader";
import { createBibleVerse, fetchBgImage } from "@/apis/openai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipLoader } from "react-spinners";

const BibleCardPage = () => {
  const [inputContent, setInputContent] = useState("");
  const [body, setBody] = useState("");
  const [verse, setVerse] = useState("");
  const [bgImage, setBgImageUrl] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  const onClickCreateBibleCard = async () => {
    if (inputContent.length < 20) {
      alert("기도제목은 20자 이상이 필요해요😭");
    }
    setLoading(true);
    const bibleVerseData = await createBibleVerse(inputContent);
    if (bibleVerseData.length == 0) {
      setIsEnded(false);
      setLoading(false);
      return null;
    }
    const imageData = await fetchBgImage(bibleVerseData[0].nature);
    if (imageData.length == 0) {
      setIsEnded(false);
      setLoading(false);
      return null;
    }
    setBgImageUrl(imageData[0]);
    setBody(bibleVerseData[0].body);
    setVerse(bibleVerseData[0].verse);
    setLoading(false);
    setIsEnded(true);
  };

  return (
    <div className="w-full h-full flex flex-col items-center pt-11 gap-6">
      <MainHeader />
      <div className="text-xl font-light">말씀 카드 만들기</div>

      <div
        className={`relative w-5/6 aspect-square flex flex-col justify-center items-center rounded-2xl p-2 transition-colors duration-1000 ease-in ${
          isEnded ? "bg-none" : "bg-gray-300"
        }`}
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <ClipLoader size={20} loading={loading} />
        <div className="absolute inset-0 bg-black opacity-35 rounded-2xl pointer-events-none"></div>
        <div
          className={`relative flex flex-col gap-3 handwritten font-bold text-2xl text-white text-center whitespace-pre-wrap transition-opacity duration-1000 ease-in ${
            isEnded ? "opacity-100" : "opacity-0"
          }`}
        >
          <p>{body}</p>
          <p>{verse}</p>
        </div>
        <span className="absolute bottom-3 right-5 font-bold text-white">
          PrayU
        </span>
      </div>

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
    </div>
  );
};

export default BibleCardPage;
