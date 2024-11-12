import { getISOTodayDateYMD } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";

interface BibleCardUIProps {
  name: string;
  keywords: string[];
}

const BibleCardUI: React.FC<BibleCardUIProps> = ({ name, keywords }) => {
  const Colors = [
    { primary: "#FFDAD7", secondary: "#AAC7FF" },
    { primary: "#ffdde1", secondary: "#AAC7FF" },
    { primary: "#6dd5ed", secondary: "#AAC7FF" },
    { primary: "#b92b27", secondary: "#AAC7FF" },
    { primary: "#4286f4", secondary: "#AAC7FF" },
    { primary: "#493240", secondary: "#AAC7FF" },
    { primary: "#4A00E0", secondary: "#AAC7FF" },
    { primary: "#99f2c8", secondary: "#AAC7FF" },
    { primary: "#b91d73", secondary: "#AAC7FF" },
    { primary: "#240b36", secondary: "#AAC7FF" },
    { primary: "#f5af19", secondary: "#FFDAD7" },
    { primary: "#f4791f", secondary: "#FFDAD7" },
    { primary: "#6be585", secondary: "#FFDAD7" },
    { primary: "#2ebf91", secondary: "#FFDAD7" },
    { primary: "#ffd452", secondary: "#FFDAD7" },
    { primary: "#ec2F4B", secondary: "#FFDAD7" },
    { primary: "#eaafc8", secondary: "#FFDAD7" },
    { primary: "#FF4B2B", secondary: "#FFDAD7" },
    { primary: "#78ffd6", secondary: "#FFDAD7" },
    { primary: "#93291E", secondary: "#FFDAD7" },
    { primary: "#0083B0", secondary: "#FFDAD7" },
  ];

  const { year, month, day } = getISOTodayDateYMD();
  const targetBible = useBaseStore((state) => state.targetBible);

  const getRandomRadius = () => `${Math.floor(Math.random() * 220)}px`;
  const { primary, secondary } =
    Colors[Math.floor(Math.random() * Colors.length)];

  return (
    <div className="relative w-[380px] h-[550px] flex flex-col rounded-[16px] px-[30px] py-[20px] bg-[#FEFDFC]">
      <div
        className="w-full aspect-square flex flex-col justify-center items-center"
        style={{
          background: `linear-gradient(159deg, ${primary}, ${secondary})`,
          borderTopLeftRadius: getRandomRadius(),
          borderTopRightRadius: getRandomRadius(),
          borderBottomRightRadius: getRandomRadius(),
          borderBottomLeftRadius: getRandomRadius(),
        }}
      >
        <div className="handwrittenV2 flex flex-col w-full h-full justify-center items-center py-[20px] px-[50px] gap-[20px] text-white text-center whitespace-pre-wrap">
          <div className="leading-[35px] tracking-[1px] text-[30px]">
            {targetBible?.sentence}
          </div>
          <div className="leading-tight text-[24px] tracking-[1px]">
            {targetBible &&
              `${targetBible.long_label} ${targetBible.chapter}${
                targetBible.long_label == "시편" ? "편" : "장"
              } ${targetBible.paragraph}절`}
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
        <span className="tracking-[1px]">{`${year}.${month}.${day}.`}</span>
        <div>@prayu.official</div>
      </div>
    </div>
  );
};

export default BibleCardUI;
