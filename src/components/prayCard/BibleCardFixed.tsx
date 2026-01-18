import { getISODateYMD } from "@/lib/utils";
import { Bible } from "../../../supabase/types/tables";

interface BibleCardProps {
  name: string;
  keywords: string[];
  bible: Bible;
  colors: string[];
  radius: string[];
  createdAt: string;
}

const BibleCardFixed: React.FC<BibleCardProps> = ({
  name,
  keywords,
  bible,
  colors,
  radius,
  createdAt,
}) => {
  const { year, month, day } = getISODateYMD(createdAt);

  const primary = colors[0];
  const secondary = colors[1];

  const topLeftRadius = radius[0];
  const topRightRadius = radius[1];
  const bottomRightRadius = radius[2];
  const bottomLeftRadius = radius[3];

  return (
    <div className="rounded-xl overflow-hidden aspect-[3/4] flex flex-col justify-between px-5 py-4 sm:py-5 bg-[#FEFDFC] border border-gray-200">
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
          <div className="handwrittenV2 flex flex-col w-full h-full justify-center items-center py-4 px-8 gap-4 sm:gap-5 text-white text-center whitespace-pre-wrap">
            <div className="leading-relaxed sm:leading-[35px] tracking-wide text-2xl sm:text-3xl md:text-[30px]">
              {bible?.sentence.replace(/<[^>]*>/g, "").trim()}
            </div>
            <div className="leading-tight text-xl sm:text-2xl md:text-[24px] tracking-wide">
              {bible &&
                `${bible.long_label} ${bible.chapter}${
                  bible.long_label == "시편" ? "편" : "장"
                } ${bible.paragraph}절`}
            </div>
          </div>
        </div>

        <div style={{ color: primary }} className="flex flex-col mt-2 sm:mt-3">
          <div className="text-3xl sm:text-4xl md:text-[40px] font-bold">
            {name}
          </div>
          <div className="text-lg sm:text-xl md:text-[20px] flex flex-wrap gap-2 text-black-500">
            {keywords.map((keyword, index) => (
              <span key={index}>#{keyword}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex justify-between w-full text-gray-600 text-xs sm:text-sm">
        <span className="tracking-wide">{`${year}.${month}.${day}.`}</span>
        <div>@prayu.official</div>
      </section>
    </div>
  );
};

export default BibleCardFixed;
