import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { dataURLToFile, getTodayNumber } from "@/lib/utils";
import { getPublicUrl, uploadImage } from "@/apis/file";
import { Button } from "@/components/ui/button";

const BibleCardGenerator: React.FC = () => {
  const bibleCardRef = useRef(null);
  const [publicUrl, setPublicUrl] = useState("");

  const Colors = [
    { primary: "#FFD194", secondary: "#D1913C" },
    { primary: "#a8c0ff", secondary: "#3f2b96" },
    { primary: "#89f7fe", secondary: "#66a6ff" },
    { primary: "#ff9966", secondary: "#ff5e62" },
    { primary: "#84fab0", secondary: "#8fd3f4" },
    { primary: "#ff9a9e", secondary: "#fecfef" },
    { primary: "#c3cfe2", secondary: "#dee2e6" },
    { primary: "#a1c4fd", secondary: "#c2e9fb" },
    { primary: "#ffafbd", secondary: "#ffc3a0" },
    { primary: "#ff9a9e", secondary: "#fad0c4" },
    { primary: "#fbc2eb", secondary: "#a6c1ee" },
    { primary: "#b91d73", secondary: "#AAC7FF" },
    { primary: "#240b36", secondary: "#AAC7FF" },
    { primary: "#f4791f", secondary: "#FFDAD7" },
    { primary: "#6be585", secondary: "#FFDAD7" },
    { primary: "#ec2F4B", secondary: "#FFDAD7" },
    { primary: "#2ebf91", secondary: "#FFDAD7" },
    { primary: "#FF4B2B", secondary: "#FFDAD7" },
    { primary: "#93291E", secondary: "#FFDAD7" },
    { primary: "#0083B0", secondary: "#FFDAD7" },
    { primary: "#3f2b96", secondary: "#AAC7FF" },
    { primary: "#636363", secondary: "#a2ab58" },
    { primary: "#4286f4", secondary: "#AAC7FF" },
    { primary: "#005AA7", secondary: "#FFFDE4" },
    { primary: "#00B4DB", secondary: "#0083B0" },
    { primary: "#4A00E0", secondary: "#AAC7FF" },
    { primary: "#1f4037", secondary: "#99f2c8" },
    { primary: "#8360c3", secondary: "#2ebf91" },
    { primary: "#ff9a9e", secondary: "#fad0c4" },
    { primary: "#a1c4fd", secondary: "#c2e9fb" },
    { primary: "#c3cfe2", secondary: "#dee2e6" },
    { primary: "#d4fc79", secondary: "#96e6a1" },
    { primary: "#fbc2eb", secondary: "#a6c1ee" },
    { primary: "#ffafbd", secondary: "#ffc3a0" },
    { primary: "#c2e9fb", secondary: "#a1c4fd" },
    { primary: "#fbc2eb", secondary: "#f8b195" },
    { primary: "#a6c0fe", secondary: "#f68084" },
    { primary: "#ff9966", secondary: "#ff5e62" },
    { primary: "#ff9a8b", secondary: "#ff6a88" },
    { primary: "#89f7fe", secondary: "#66a6ff" },
    { primary: "#b2fefa", secondary: "#0ed2f7" },
    { primary: "#c471ed", secondary: "#f64f59" },
    { primary: "#f6d365", secondary: "#fda085" },
    { primary: "#d4fc79", secondary: "#96e6a1" },
    { primary: "#ff9a9e", secondary: "#fecfef" },
    { primary: "#84fab0", secondary: "#8fd3f4" },
    { primary: "#ffd1ff", secondary: "#fcb9b2" },
    { primary: "#ffafbd", secondary: "#ffc3a0" },
    { primary: "#cfd9df", secondary: "#e2ebf0" },
    { primary: "#c1dfc4", secondary: "#deecdd" },
    { primary: "#e0c3fc", secondary: "#8ec5fc" },
    { primary: "#3f2b96", secondary: "#a8c0ff" },
    { primary: "#ffd452", secondary: "#ff9a9e" },
  ];

  const getRandomRadius = () => `${Math.floor(Math.random() * 220)}px`;

  // 푸른 게열 22
  // 붉은 계열 41
  // 보라 계열 51
  // 초록 계열 26
  // 노란 계열 31
  // 주황 계열 8
  // 핑크 계열 36

  // 164px 144px 198px 192px
  // 127px 219px 101px 127px
  // 173px 69px 202px 41px
  // 182px 161px 92px 25px

  const index = Math.floor(Math.random() * Colors.length);
  const { primary, secondary } = Colors[26];
  console.log(index);
  console.log(primary, secondary);
  const style = {
    background: `linear-gradient(159deg, ${primary}, ${secondary})`,
    borderTopLeftRadius: getRandomRadius(),
    borderTopRightRadius: getRandomRadius(),
    borderBottomRightRadius: getRandomRadius(),
    borderBottomLeftRadius: getRandomRadius(),
  };

  const name = "김영광";
  const keywords = ["믿음", "신뢰", "역사"];
  const content =
    "우리 가운데서 역사하시는 능력대로 우리가 구하거나 생각하는 모든 것에 더 넘치도록 능히 하실 이에게";
  const verse = "에베소서 3장 20절";
  const date = "2024.11.11";

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
      return publicUrl;
    } catch {
      return null;
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      {!publicUrl && (
        <div
          ref={bibleCardRef}
          className="relative w-[380px] h-[550px] flex flex-col rounded-[16px] px-[30px] py-[20px] bg-[#FEFDFC]"
        >
          <div
            className="w-full aspect-square flex flex-col justify-center items-center"
            style={style}
          >
            <div className="handwrittenV2 flex flex-col w-full h-full justify-center items-center py-[20px] px-[50px] gap-[20px] text-white text-center whitespace-pre-wrap">
              <div className="leading-[35px] tracking-[1px] text-[30px]">
                {content}
              </div>
              <div className="leading-tight text-[24px] tracking-[1px]">
                {verse}
              </div>
            </div>
          </div>

          <div style={{ color: primary }} className="flex flex-col mt-[0px]">
            <div className="text-[40px] font-bold ">{name}</div>
            <div className="text-[20px] flex gap-[8px] text-black-500 ">
              {keywords.map((keyword, index) => (
                <span key={index}>#{keyword}</span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-[25px] flex gap-[130px] text-[#666666]">
            <span className="tracking-[1px]">{date}</span>
            <div>@prayu.official</div>
          </div>
        </div>
      )}

      <img src={publicUrl} className="w-3/4" />
      <Button className="w-5/6" variant="primary" onClick={() => loadImage()}>
        이미지 생성
      </Button>
    </div>
  );
};

export default BibleCardGenerator;
