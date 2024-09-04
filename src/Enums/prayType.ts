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
    bgColor: "bg-gradient-to-br from-[#6DCAEC] to-[#1EA6D8]",
    shadowColor: "shadow-[0_5px_5px_rgb(50,175,221,0.25)]",
  },
  [PrayType.GOOD]: {
    img: goodIcon,
    reactImg: goodIconToOther,
    emoji: "👍",
    text: "힘내세요",
    icon: goodIconOnly,
    bgColor: "bg-gradient-to-br from-[#A58DFF] to-[#8163EE]",
    shadowColor: "shadow-[0_5px_5px_rgb(129,100,238,0.25)]",
  },
  [PrayType.LIKE]: {
    img: likeIcon,
    reactImg: likeIconToOther,
    emoji: "❤️",
    text: "응원해요",
    icon: likeIconOnly,
    bgColor: "bg-gradient-to-br from-[#FF878C] to-[#F14950]",
    shadowColor: "shadow-[0_5px_5px_rgb(235,87,93,0.25)]",
  },
};
