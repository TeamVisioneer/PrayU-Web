
interface BibleCardProps {
  name: string;
  keywords: string[];
  colors: string[];
  radius: string[];
  bibleReference: string;
  bibleSentence: string;
  createdAt: string;
}

const BibleCardFixed: React.FC<BibleCardProps> = ({
  name,
  keywords,
  bibleReference,
  bibleSentence,
  colors,
  radius,
  createdAt,
}) => {

  const primary = colors[0];
  const secondary = colors[1];

  const topLeftRadius = radius[0];
  const topRightRadius = radius[1];
  const bottomRightRadius = radius[2];
  const bottomLeftRadius = radius[3];

  return (
    <div className="relative w-[380px] aspect-[3/4] flex flex-col justify-between px-[30px] py-[20px] bg-[#FEFDFC] border-[1px] border-gray-200">
      <section>
        <div
          className="w-full aspect-square flex flex-col justify-center items-center"
          style={{
            background: `linear-gradient(159deg, ${primary}, ${secondary})`,
            borderTopLeftRadius: topLeftRadius,
            borderTopRightRadius: topRightRadius,
            borderBottomRightRadius: bottomRightRadius,
            borderBottomLeftRadius: bottomLeftRadius,
          }}
        >
          <div className="handwrittenV2 flex flex-col w-full h-full justify-center items-center py-[20px] px-[50px] gap-[10px] text-white text-center whitespace-pre-wrap">
            <div className="leading-[35px] tracking-[1px] text-[30px]">
                {bibleSentence.replace(/<[^>]*>/g, "").replace(/○/g, " ").trim()}
            </div>
            <div className="leading-tight text-[24px] tracking-[1px]">
                {bibleReference}
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
      </section>

      <section className="flex justify-between w-full text-[#666666]">
        <span className="tracking-[1px]">{createdAt}</span>
        <div>@prayu.official</div>
      </section>
    </div>
  );
};

export default BibleCardFixed;
