import { getISOTodayDateYMD } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";

interface BibleCardUIProps {
  name: string;
}

const BibleCardUI: React.FC<BibleCardUIProps> = ({ name }) => {
  const { year, month, day } = getISOTodayDateYMD();
  const targetBible = useBaseStore((state) => state.targetBible);

  const Colors = [
    { primary: "#bdc3c7", secondary: "#2c3e50" },
    { primary: "#ee9ca7", secondary: "#ffdde1" },
    { primary: "#2193b0", secondary: "#6dd5ed" },
    { primary: "#b92b27", secondary: "#b92b27" },
    { primary: "#373B44", secondary: "#4286f4" },
    { primary: "#FF0099", secondary: "#493240" },
    { primary: "#8E2DE2", secondary: "#4A00E0" },
    { primary: "#1f4037", secondary: "#99f2c8" },
    { primary: "#f953c6", secondary: "#b91d73" },
    { primary: "#c31432", secondary: "#240b36" },
    { primary: "#f12711", secondary: "#f5af19" },
    { primary: "#659999", secondary: "#f4791f" },
    { primary: "#dd3e54", secondary: "#6be585" },
    { primary: "#8360c3", secondary: "#2ebf91" },
    { primary: "#544a7d", secondary: "#ffd452" },
    { primary: "#009FFF", secondary: "#ec2F4B" },
    { primary: "#654ea3", secondary: "#eaafc8" },
    { primary: "#FF416C", secondary: "#FF4B2B" },
    { primary: "#a8ff78", secondary: "#78ffd6" },
    { primary: "#ED213A", secondary: "#93291E" },
    { primary: "#00B4DB", secondary: "#0083B0" },
  ];

  const getRandomRadius = () => `${Math.floor(Math.random() * 300)}px`;
  const { primary, secondary } =
    Colors[Math.floor(Math.random() * Colors.length)];

  return (
    <div className="relative w-[400px] h-[600px] flex flex-col rounded-[16px] gap-[20px] px-[25px] py-[20px] bg-[#f8f7ef]">
      <div
        className="w-full aspect-square flex flex-col justify-center items-center rounded-tl-[220px] rounded-tr-[220px] rounded-br-[220px] rounded-bl-[5px]"
        style={{
          background: `linear-gradient(159deg, ${primary}, ${secondary})`,
          borderTopLeftRadius: getRandomRadius(),
          borderTopRightRadius: getRandomRadius(),
          borderBottomRightRadius: getRandomRadius(),
          borderBottomLeftRadius: getRandomRadius(),
        }}
      >
        <div className="flex flex-col w-full h-full justify-center items-center pt-[60px] p-[30px] gap-[20px] text-[24px] handwritten font-bold  text-white text-center whitespace-pre-wrap">
          <p className="leading-tight">
            그러므로 자기를 힘입어 하나님께 나아가는 자들을 온전히 구원하실 수
            있으니 이는 그가 항상 살아서 저희를 위하여 간구하심이니라
            {/* {targetBible?.sentence} */}
          </p>
          <p>
            {/* {`${targetBible?.long_label} ${targetBible?.chapter}${
              targetBible?.long_label == "시편" ? "편" : "장"
            } ${targetBible?.paragraph}절`} */}
            히브리서 7장 25절
          </p>
        </div>
      </div>

      <section style={{ color: primary }} className="flex flex-col gap-[2px]">
        <h2 className="text-[40px] font-bold tracking-[2px]">{name}</h2>
        <div className="text-[20px] flex gap-[8px] text-black-500 ">
          <span>#도전</span>
          <span>#믿음</span>
          <span>#신뢰</span>
        </div>
      </section>

      <section className="absolute bottom-[20px]">
        <div
          style={{ color: primary, borderColor: primary }}
          className="text-[14px] h-[30px] flex border-[1px] rounded-[5px] items-center"
        >
          <span className="px-[10px]">PrayU</span>
          <span
            className="h-full aspect-square border-l-[1px] border-r-[1px] "
            style={{
              color: primary,
              borderColor: primary,
              backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 1.5px, ${primary} 2px, ${primary} 3px)`,
            }}
          ></span>
          <span className="px-[10px]">{`${year}. ${month}. ${day}.`}</span>
        </div>
      </section>
    </div>
  );
};

export default BibleCardUI;
