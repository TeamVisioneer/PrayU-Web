import prayIcon from "@/assets/pray.svg";
import goodIcon from "@/assets/good.svg";
import likeIcon from "@/assets/like.svg";
import prayIconToOther from "@/assets/prayToOther.svg";
import goodIconToOther from "@/assets/goodToOther.svg";
import likeIconToOther from "@/assets/likeToOther.svg";
import prayIconOnly from "@/assets/icon-pray-mono.svg";
import goodIconOnly from "@/assets/icon-thumb-up-mono.svg";
import likeIconOnly from "@/assets/icon-heart-mono.svg";

export enum PrayType {
  GOOD = "good",
  PRAY = "pray",
  LIKE = "like",
}

export const PrayTypeDatas = {
  [PrayType.PRAY]: {
    img: prayIcon,
    reactImg: prayIconToOther,
    emoji: "🙏",
    text: "기도해요",
    icon: prayIconOnly,
    bgColor: "bg-[#6DCAEC]",
  },
  [PrayType.GOOD]: {
    img: goodIcon,
    reactImg: goodIconToOther,
    emoji: "👍",
    text: "힘내세요",
    icon: goodIconOnly,
    bgColor: "bg-[#9A7FFF]",
  },
  [PrayType.LIKE]: {
    img: likeIcon,
    reactImg: likeIconToOther,
    emoji: "❤️",
    text: "응원해요",
    icon: likeIconOnly,
    bgColor: "bg-[#FF888C]",
  },
};
