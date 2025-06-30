import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { dataURLToFile, getTodayNumber } from "@/lib/utils";
import { getPublicUrl, uploadImage } from "@/apis/file";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BibleCardGenerator: React.FC = () => {
  const bibleCardRef = useRef(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Corner radius states
  const [ltRoundValue, setLtRoundValue] = useState(10);
  const [rtRoundValue, setRtRoundValue] = useState(10);
  const [lbRoundValue, setLbRoundValue] = useState(10);
  const [rbRoundValue, setRbRoundValue] = useState(10);
  const [uniformRadius, setUniformRadius] = useState(true);

  // Content states
  const [name, setName] = useState("홍길동");
  const [content, setContent] = useState(
    "여호와는 나의 목자시니\n내게 부족함이 없으리로다"
  );
  const [verse, setVerse] = useState("시편 23:1");
  const [keywords, setKeywords] = useState("#목자 #평안 #은혜");
  const [dateValue, setDateValue] = useState(new Date().toLocaleDateString());

  // Color states
  const [primaryColor, setPrimaryColor] = useState("#6366F1");
  const [secondaryColor, setSecondaryColor] = useState("#8B5CF6");

  const style = {
    background: `linear-gradient(159deg, ${primaryColor}, ${secondaryColor})`,
    borderTopLeftRadius: `${ltRoundValue}px`,
    borderTopRightRadius: `${rtRoundValue}px`,
    borderBottomRightRadius: `${rbRoundValue}px`,
    borderBottomLeftRadius: `${lbRoundValue}px`,
  };

  const handleUniformRadiusChange = (value: number) => {
    if (uniformRadius) {
      setLtRoundValue(value);
      setRtRoundValue(value);
      setLbRoundValue(value);
      setRbRoundValue(value);
    }
  };

  const loadImage = async () => {
    if (bibleCardRef.current === null) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(bibleCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
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
    } finally {
      setIsGenerating(false);
    }
  };

  const resetCard = () => {
    setPublicUrl("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            성경 카드 생성기
          </h1>
          <p className="text-gray-600">나만의 성경 말씀 카드를 만들어보세요</p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Preview Section */}
          <div className="flex flex-col items-center space-y-6">
            <Card className="p-6 bg-white shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                미리보기
              </h2>
              <div className="flex justify-center">
                <div
                  ref={bibleCardRef}
                  className="relative w-[380px] h-[550px] flex flex-col rounded-[16px] px-[30px] py-[20px] bg-[#FEFDFC] border-[1px] border-gray-200 shadow-xl"
                >
                  <div
                    className="w-full aspect-square flex flex-col justify-center items-center"
                    style={style}
                  >
                    <div className="handwrittenV2 flex flex-col w-full h-full justify-center items-center py-[20px] px-[50px] gap-[20px] text-white text-center whitespace-pre-wrap">
                      <div className="leading-[35px] tracking-[1px] text-[30px]">
                        {content || "말씀을 입력해주세요"}
                      </div>
                      <div className="leading-tight text-[24px] tracking-[1px]">
                        {verse || "구절을 입력해주세요"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{ color: primaryColor }}
                    className="flex flex-col mt-[0px]"
                  >
                    <div className="text-[40px] font-bold">
                      {name || "이름"}
                    </div>
                    <div className="text-[20px] flex gap-[8px] text-black-500">
                      {keywords || "#키워드"}
                    </div>
                  </div>

                  <div className="absolute bottom-[25px] flex gap-[130px] text-[#666666]">
                    <span className="tracking-[1px]">{dateValue}</span>
                    <div>@prayu.official</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Generated Image */}
            {publicUrl && (
              <Card className="p-6 bg-white shadow-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">생성된 이미지</h3>
                  <Button variant="outline" onClick={resetCard}>
                    다시 편집하기
                  </Button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={publicUrl}
                    alt="Generated Bible Card"
                    className="w-full max-w-md rounded-lg shadow-lg"
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-white shadow-lg">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">내용</TabsTrigger>
                  <TabsTrigger value="design">디자인</TabsTrigger>
                  <TabsTrigger value="corners">모서리</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      이름
                    </label>
                    <Input
                      placeholder="이름을 입력하세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      말씀 내용
                    </label>
                    <Textarea
                      placeholder="성경 말씀을 입력하세요"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      성경 구절
                    </label>
                    <Input
                      placeholder="예: 요한복음 3:16"
                      value={verse}
                      onChange={(e) => setVerse(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      키워드/해시태그
                    </label>
                    <Input
                      placeholder="예: #사랑 #은혜 #감사"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      날짜
                    </label>
                    <Input
                      placeholder="날짜를 입력하세요"
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      메인 색상
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 p-1 border"
                      />
                      <Input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      보조 색상
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-10 p-1 border"
                      />
                      <Input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPrimaryColor("#6366F1");
                        setSecondaryColor("#8B5CF6");
                      }}
                    >
                      보라 그라데이션
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPrimaryColor("#F59E0B");
                        setSecondaryColor("#EF4444");
                      }}
                    >
                      따뜻한 그라데이션
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPrimaryColor("#10B981");
                        setSecondaryColor("#3B82F6");
                      }}
                    >
                      시원한 그라데이션
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPrimaryColor("#8B5CF6");
                        setSecondaryColor("#EC4899");
                      }}
                    >
                      핑크 그라데이션
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="corners" className="space-y-4 mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="uniform"
                      checked={uniformRadius}
                      onChange={(e) => setUniformRadius(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="uniform" className="text-sm font-medium">
                      모든 모서리 동일하게 적용
                    </label>
                  </div>

                  {uniformRadius ? (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        모서리 곡률: {ltRoundValue}px
                      </label>
                      <Input
                        type="range"
                        min="0"
                        max="200"
                        value={ltRoundValue}
                        onChange={(e) =>
                          handleUniformRadiusChange(parseInt(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          좌상단: {ltRoundValue}px
                        </label>
                        <Input
                          type="range"
                          min="0"
                          max="200"
                          value={ltRoundValue}
                          onChange={(e) =>
                            setLtRoundValue(parseInt(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          우상단: {rtRoundValue}px
                        </label>
                        <Input
                          type="range"
                          min="0"
                          max="200"
                          value={rtRoundValue}
                          onChange={(e) =>
                            setRtRoundValue(parseInt(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          좌하단: {lbRoundValue}px
                        </label>
                        <Input
                          type="range"
                          min="0"
                          max="200"
                          value={lbRoundValue}
                          onChange={(e) =>
                            setLbRoundValue(parseInt(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          우하단: {rbRoundValue}px
                        </label>
                        <Input
                          type="range"
                          min="0"
                          max="200"
                          value={rbRoundValue}
                          onChange={(e) =>
                            setRbRoundValue(parseInt(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t">
                <Button
                  className="w-full h-12 text-lg"
                  onClick={loadImage}
                  disabled={isGenerating}
                >
                  {isGenerating ? "생성중..." : "🎨 이미지 생성하기"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleCardGenerator;
