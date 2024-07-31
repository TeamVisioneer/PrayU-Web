import prayIcon from "@/assets/pray.svg";
import goodIcon from "@/assets/good.svg";
import likeIcon from "@/assets/like.svg";
import prayIconToOther from "@/assets/prayToOther.svg";
import goodIconToOther from "@/assets/goodToOther.svg";
import likeIconToOther from "@/assets/likeToOther.svg";

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
  },
  [PrayType.GOOD]: {
    img: goodIcon,
    reactImg: goodIconToOther,
    emoji: "👍",
    text: "힘내세요",
  },
  [PrayType.LIKE]: {
    img: likeIcon,
    reactImg: likeIconToOther,
    emoji: "❤️",
    text: "응원해요",
  },
};
