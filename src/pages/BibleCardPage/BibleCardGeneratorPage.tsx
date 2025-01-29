import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { dataURLToFile, getTodayNumber } from "@/lib/utils";
import { getPublicUrl, uploadImage } from "@/apis/file";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const BibleCardGenerator: React.FC = () => {
  const bibleCardRef = useRef(null);
  const [publicUrl, setPublicUrl] = useState("");

  const [ltRoundValue, setLtRoundValue] = useState(10);
  const [rtRoundValue, setRtRoundValue] = useState(10);
  const [lbRoundValue, setLbRoundValue] = useState(10);
  const [rbRoundValue, setRbRoundValue] = useState(10);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [verse, setVerse] = useState("");
  const [keywords, setKeywords] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#000000");

  const style = {
    background: `linear-gradient(159deg, ${primaryColor}, ${secondaryColor})`,
    borderTopLeftRadius: `${ltRoundValue}px`,
    borderTopRightRadius: `${rtRoundValue}px`,
    borderBottomRightRadius: `${rbRoundValue}px`,
    borderBottomLeftRadius: `${lbRoundValue}px`,
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
      return publicUrl;
    } catch {
      return null;
    }
  };

  return (
    <div className="p-5 w-full h-full flex flex-col gap-4 items-center ">
      {!publicUrl && (
        <div className="w-full flex flex-col items-center">
          <div
            ref={bibleCardRef}
            className="relative w-[380px] h-[550px] flex flex-col rounded-[16px] px-[30px] py-[20px] bg-[#FEFDFC] border-[1px] border-gray-200"
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

            <div
              style={{ color: primaryColor }}
              className="flex flex-col mt-[0px]"
            >
              <div className="text-[40px] font-bold ">{name}</div>
              <div className="text-[20px] flex gap-[8px] text-black-500 ">
                {keywords}
              </div>
            </div>

            <div className="absolute bottom-[25px] flex gap-[130px] text-[#666666]">
              <span className="tracking-[1px]">{dateValue}</span>
              <div>@prayu.official</div>
            </div>
          </div>
          <section className="w-5/6 flex flex-col gap-1 items-center justify-center">
            <Input
              type="range"
              min="0"
              max="300"
              value={ltRoundValue}
              onChange={(e) => setLtRoundValue(parseInt(e.target.value))}
              className="w-full"
            />
            <Input
              type="range"
              min="0"
              max="300"
              value={rtRoundValue}
              onChange={(e) => setRtRoundValue(parseInt(e.target.value))}
              className="w-full"
            />
            <Input
              type="range"
              min="0"
              max="300"
              value={lbRoundValue}
              onChange={(e) => setLbRoundValue(parseInt(e.target.value))}
              className="w-full"
            />
            <Input
              type="range"
              min="0"
              max="300"
              value={rbRoundValue}
              onChange={(e) => setRbRoundValue(parseInt(e.target.value))}
              className="w-full"
            />
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
            <Input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
            />
            <Input
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="말씀"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></Textarea>
            <Input
              placeholder="구절"
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
            />
            <Input
              placeholder="키워드"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <Input
              placeholder="날짜"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
            />
            <Button
              className="w-full"
              variant="primary"
              onClick={() => loadImage()}
            >
              이미지 생성
            </Button>
          </section>
        </div>
      )}

      <img src={publicUrl} className="w-3/4" />
    </div>
  );
};

export default BibleCardGenerator;
