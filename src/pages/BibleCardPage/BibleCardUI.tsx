import { getISOTodayDateYMD } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";

interface BibleCardUIProps {
  name: string;
  keywords: string[];
}

const BibleCardUI: React.FC<BibleCardUIProps> = ({ name, keywords }) => {
  const Colors = [
    { primary: "#FFD194", secondary: "#D1913C" }, // 따뜻한 노을과 바다 색
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

  const { year, month, day } = getISOTodayDateYMD();
  const targetBible = useBaseStore((state) => state.targetBible);

  const getRandomRadius = () => `${Math.floor(Math.random() * 220)}px`;
  const { primary, secondary } =
    Colors[Math.floor(Math.random() * Colors.length)];

  return (
    <div className="relative w-[380px] h-[550px] flex flex-col rounded-[16px] px-[30px] py-[20px] bg-[#FEFDFC] border-[1px] border-gray-200">
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
            {targetBible?.sentence.replace(/<[^>]*>/g, "").trim()}
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
